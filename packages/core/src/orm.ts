import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { OrderByCriteria, OrderByOrders } from './orderBy'
import type { Prettify } from './types'
import { orderBy } from './orderBy'

interface ZodSchemaWithId extends ZodObject<{ id: ZodNumber | ZodString }, any, any> {}
export interface ObjectWithId extends z.infer<ZodSchemaWithId> {}

type ShapeToFields<S extends ZodObject<{ id: ZodNumber | ZodString }, any, any>> = {
  [K in keyof S['shape']]: {
    zodType: S['shape'][K]
    name: K
  }
}

type _TypeOfRelations<R extends Record<never, Relation>, T extends keyof R = keyof R> =
    {
      [K in T]: R[K] extends Relation<infer K extends RelationKind, infer E extends Entity<any, any>> ?
        K extends 'many' ? Array<z.infer<E['zodSchema']>> : z.infer<E['zodSchema']>
        : never
    }

interface Entity<N extends string, S extends ZodSchemaWithId> {
  zodSchema: S
  name: N
  fields: ShapeToFields<S>
}

type RelationKind = 'one' | 'many'

interface Field {
  zodType: ZodNumber | ZodString
  name: string
}

interface Relation<K extends RelationKind = RelationKind, E extends Entity<any, any> = Entity<any, any>> {
  kind: K
  field: Field
  reference: {
    entity: E
    field: Field
  }
}

interface RelationOptions {
  reference: Field
  field: Field
}

function one<E extends Entity<any, any>>(entity: E, { reference, field }: RelationOptions): Relation<'one', E> {
  return {
    kind: 'one',
    field,
    reference: {
      entity,
      field: reference,
    },
  }
}

function many<E extends Entity<any, any>>(entity: E, { reference, field }: RelationOptions): Relation<'many', E> {
  return {
    kind: 'many',
    field,
    reference: {
      entity,
      field: reference,
    },
  }
}

interface RelationsOptions {
  one: typeof one
  many: typeof many
}

interface Signal {
  depend: () => void
  trigger: () => void
}

type Db = Record<string, Record<ObjectWithId['id'], ObjectWithId>>
type ProxyValue<T extends object> = (string extends keyof T ? T[keyof T & string] : any) | (symbol extends keyof T ? T[keyof T & symbol] : any)

let db: Db = {}

export function getDb(): Db {
  return db
}

export function defineReactivityAdapter(signalFactory: () => Signal): void {
  db = createReactiveProxy(db, signalFactory())
}

function createReactiveProxy<T extends object>(target: T, signal: Signal): T {
  return new Proxy(target, {
    get(target, prop, receiver): ProxyValue<T> {
      const value = Reflect.get(target, prop, receiver)
      signal.depend()

      return typeof value === 'object' && value !== null ? createReactiveProxy(value, signal) : value
    },
    set(target, prop, value, receiver): boolean {
      const result = Reflect.set(target, prop, value, receiver)
      signal.trigger()
      return result
    },
  })
}

export function defineEntity<N extends string, S extends ZodSchemaWithId>(name: N, schema: S): Entity<N, S> {
  const fields = Object.entries(schema.shape).reduce((acc, [key, value]) => {
    acc[key as keyof S['shape']] = {
      zodType: value,
      name: key,
    } as ShapeToFields<S>[keyof S['shape']]
    return acc
  }, {} as ShapeToFields<S>)

  db[name] = {}

  return { name, fields, zodSchema: schema }
}

interface LoadRelationsOptions<T extends ObjectWithId, R extends Record<never, Relation>> {
  entity: T
  relations: R
  relationsToLoad: Array<keyof R>
  entityName: string
}

function loadRelations<T extends ObjectWithId, R extends Record<never, Relation>>({
  entity,
  relations,
  relationsToLoad,
  entityName,
}: LoadRelationsOptions<T, R>): T & Partial<_TypeOfRelations<R>> {
  const entityWithRelations = { ...entity } as T & Partial<_TypeOfRelations<R>>

  for (const relationName of relationsToLoad) {
    const relation = relations[relationName] as Relation
    if (!relation) {
      throw new Error(`Relation ${String(relationName)} not found on entity ${entityName}`)
    }

    const refEntityName = relation.reference.entity.name
    const refDb = db[refEntityName]

    const arrayFunc: 'filter' | 'find' = relation.kind === 'many' ? 'filter' : 'find'

    // @ts-expect-error can't valid the type between ObjectWithId and the relation type
    entityWithRelations[relationName] = Object.values(refDb || {})[arrayFunc]((value: ObjectWithId) => {
      return value[relation.reference.field.name as keyof ObjectWithId] === entity[relation.field.name as keyof ObjectWithId]
    })
  }

  return entityWithRelations
}

type Relations<Names extends string> = Partial<Record<Names, Record<string, Relation>>>

type WithRelationsOption<E extends Entity<any, any>, R extends Relations<any>> = {
  [K in keyof R[E['name']]]?: boolean | (R[E['name']][K] extends Relation<any, infer RE> ? WithRelationsOption<RE, R> : never)
}

type GetRelationType<R extends Relation<any, any>> =
  R extends Relation<infer RK, infer RE> ?
    RK extends 'many' ? Array<z.infer<RE['zodSchema']>> : z.infer<RE['zodSchema']>
    : never

type GetNestedRelationType<
  E extends Entity<any, any>,
  R extends Relations<any>,
  O extends WithRelationsOption<any, R>,
  isPartial extends boolean,
> = Prettify<z.infer<E['zodSchema']> & (
  isPartial extends true
    ? Partial<TypeOfRelations<E, R, O>>
    : TypeOfRelations<E, R, O>
)>

type TypeOfRelations<
  E extends Entity<any, any>,
  R extends Relations<any>,
  O extends WithRelationsOption<E, R>,
  isPartial extends boolean = false,
> = {
  [K in keyof O]: O[K] extends true ?
    K extends keyof R[E['name']] ?
      R[E['name']][K] extends Relation<any, any> ?
        GetRelationType<R[E['name']][K]>
        : never
      : never
    : O[K] extends WithRelationsOption<any, R> ?
      K extends keyof R[E['name']] ?
        R[E['name']][K] extends Relation<infer RK, infer RE> ?
          RK extends 'many' ?
            Array<GetNestedRelationType<RE, R, O[K], isPartial>>
            : GetNestedRelationType<RE, R, O[K], isPartial>
          : never
        : never
      : never
}

interface Query<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId = z.infer<E['zodSchema']>> {
  with: <W extends WithRelationsOption<E, R>>(relations: W) => Query<E, R, Prettify<T & TypeOfRelations<E, R, W>>>
  get: () => Array<T>
}

type RelationsFn<Names extends string, R extends Relations<Names>> = (options: RelationsOptions) => R

type DeepEntityRelationsOption<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>> = {
  [K in keyof R[E['name']]]: R[E['name']][K] extends Relation<any, infer RE> ?
    DeepEntityRelationsOption<RE, R>
    : never
}

interface QueryBuilder<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId = z.infer<E['zodSchema']>> {
  query: () => Query<E, R, T>
  findById: <O extends { with?: WithRelationsOption<E, R> }>(id: T['id'], options?: O) => O extends { with: any } ? Prettify<T & TypeOfRelations<E, R, O['with'], true>> | null : T | null
  save: (entities: Array<Prettify<T & Partial<TypeOfRelations<E, R, DeepEntityRelationsOption<E, R>, true>>>>) => void
}

type GlobalQueryBuilder<E extends Array<Entity<string, ZodSchemaWithId>>, N extends E[number]['name'], R extends Relations<N>> = {
  [K in N]: QueryBuilder<Extract<E[number], { name: K }>, R>
}

export function defineQueryBuilder<
  E extends Array<Entity<string, ZodSchemaWithId>>,
  N extends E[number]['name'],
  R extends Relations<N>,
>(entities: E, relationsFn?: RelationsFn<N, R>): GlobalQueryBuilder<E, N, R> {
  const relations = relationsFn?.({ one, many }) || {} as R
  const relationsNames = Object.keys(relations) as N[]

  return { }
}

// export function _defineQueryBuilder<E extends Entity<string, ZodSchemaWithId>, T extends z.infer<E['zodSchema']>, R extends Record<never, Relation>>(
//   entity: E,
//   relationsFn?: RelationsFn<R>,
// ): QueryBuilder<E, T, R> {
//   const relations = relationsFn?.({ one, many }) || {} as R
//   const relationsNames = Object.keys(relations)

//   function save(_entities: EntityWithOptionalRelations<T, R>[]): void {
//     for (const e of _entities) {
//       db[entity.name]![e.id] = { id: e.id }

//       for (const key of Object.keys(e)) {
//         if (relationsNames.includes(key)) {
//           // @ts-expect-error key is a string, but we can use it to index the object
//           const relation = relations[key] as Relation

//           const refEntityName = relation.reference.entity.name
//           // @ts-expect-error key is a string, but we can use it to index the object
//           const relationObject = e[key]! as ObjectWithId | ObjectWithId[]

//           // Handle array relations (many)
//           if (Array.isArray(relationObject)) {
//             for (const refEntity of relationObject) {
//               db[refEntityName]![refEntity.id] = relation.reference.entity.zodSchema.parse(refEntity)
//             }
//           }
//           // Handle single relations (one)
//           else {
//             db[refEntityName]![relationObject.id] = relation.reference.entity.zodSchema.parse(relationObject)
//           }
//         }
//         // else handle regular properties
//         else {
//           const k = key as keyof ShapeToFields<ZodSchemaWithId>
//           db[entity.name]![e.id]![k] = entity.fields[k].zodType.parse(e[k])
//         }
//       }
//     }
//   }

//   function findById<O extends FindOptions<R>>(id: T['id'], options?: O): FindResult<T, R, O> | null {
//     const dbEntity = db[entity.name]!
//     const foundEntity = { ...dbEntity[id] } as T

//     if (!Object.keys(foundEntity).length) {
//       return null
//     }

//     if (options?.with && options.with.length > 0) {
//       return loadRelations({
//         entity: foundEntity,
//         relations,
//         relationsToLoad: options.with,
//         entityName: entity.name,
//       }) as FindResult<T, R, O>
//     }

//     return foundEntity as FindResult<T, R, O>
//   }

//   const queryWhereFilters: Array<(arr: T[]) => T[]> = []
//   const queryOrWhereFilters: Array<(arr: T[]) => T[]> = []
//   const queryRelationsToLoad: (keyof R)[] = []
//   const queryOrderBy: { criteria: OrderByCriteria<T>, orders: OrderByOrders } = { criteria: [], orders: [] }

//   function resetQuery(): void {
//     queryWhereFilters.length = 0
//     queryOrWhereFilters.length = 0
//     queryRelationsToLoad.length = 0
//     queryOrderBy.criteria.length = 0
//     queryOrderBy.orders.length = 0
//   }

//   type QueryResult = FindResult<T, R, { with: (keyof R)[] }>

//   function query(): Query<T, R> {
//     return {
//       where: (cb): Query<T, R> => {
//         queryWhereFilters.push(arr => arr.filter(cb))
//         return query()
//       },
//       orWhere: (cb): Query<T, R> => {
//         queryOrWhereFilters.push(arr => arr.filter(cb))
//         return query()
//       },
//       with: (relation): Query<T, R> => {
//         if (!relationsNames.includes(relation as string)) {
//           throw new Error(`Relation ${String(relation)} not found on entity ${entity.name}`)
//         }

//         queryRelationsToLoad.push(relation)
//         return query()
//       },
//       orderBy: (criteria, orders): Query<T, R> => {
//         queryOrderBy.criteria = criteria
//         queryOrderBy.orders = orders
//         return query()
//       },
//       get: (): QueryResult[] => {
//         const dbEntity = db[entity.name]!
//         let result = Object.values(dbEntity) as T[]

//         if (queryOrWhereFilters.length > 0 && queryWhereFilters.length === 0) {
//           throw new Error('Cannot use orWhere without where')
//         }

//         if (queryWhereFilters.length > 0) {
//           result = queryWhereFilters.reduce((acc, filter) => filter(acc), result)
//         }

//         if (queryOrWhereFilters.length > 0) {
//           const orResults = queryOrWhereFilters.flatMap(filter => filter(Object.values(dbEntity) as T[]))
//           result = [...new Set([...result, ...orResults])]
//         }

//         if (queryOrderBy.criteria.length > 0) {
//           result = result.sort(orderBy(queryOrderBy))
//         }

//         if (queryRelationsToLoad.length > 0) {
//           result = result.map((e) => {
//             const withRelations = loadRelations({
//               entity: e,
//               relations,
//               relationsToLoad: queryRelationsToLoad,
//               entityName: entity.name,
//             })
//             return withRelations as QueryResult
//           })
//         }

//         resetQuery()

//         return result as QueryResult[]
//       },
//     }
//   }

//   return {
//     findById,
//     save,
//     query,
//   }
// }
