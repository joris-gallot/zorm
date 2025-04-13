import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { Database } from './database'
import type { OrderByCriteria, OrderByOrders } from './orderBy'
import type { Simplify } from './types'
import { DefaultDatabase } from './database'
import { orderBy } from './orderBy'

interface ZodSchemaWithId extends ZodObject<{ id: ZodNumber | ZodString }, any, any> {}
export interface ObjectWithId { id: number | string }

type ShapeToFields<S extends ZodObject<{ id: ZodNumber | ZodString }, any, any>> = {
  [K in keyof S['shape']]: {
    zodType: S['shape'][K]
    name: K
  }
}

interface FindOptions<R extends Record<never, Relation>> { with?: Array<keyof R> }

type RelationsToType<R extends Record<never, Relation>, T extends keyof R = keyof R> =
    {
      [K in T]: R[K] extends Relation<infer K extends RelationKind, infer E extends Entity<any>> ?
        K extends 'many' ? Array<z.infer<E['zodSchema']>> : z.infer<E['zodSchema']>
        : never
    }

type EntityWithOptionalRelations<T extends ObjectWithId, R extends Record<never, Relation>> = keyof R extends never ? T : T & Simplify<Partial<RelationsToType<R>>>

type FindResult<T, R extends Record<never, Relation>, O extends FindOptions<R>> = O extends { with: Array<infer U extends keyof R> } ? Simplify<T & RelationsToType<R, U>> : T

interface Query<T extends ObjectWithId, R extends Record<never, Relation>> {
  where: (cb: (value: T) => boolean) => Query<T, R>
  orWhere: (cb: (value: T) => boolean) => Query<T, R>
  with: (relation: keyof R) => Query<T, R>
  orderBy: (criteria: OrderByCriteria<T>, orders: OrderByOrders) => Query<T, R>
  get: () => Array<FindResult<T, R, { with: (keyof R)[] }>>
}

interface Entity<S extends ZodSchemaWithId> {
  zodSchema: S
  name: string
  fields: ShapeToFields<S>
}

interface QueryBuilder<E extends Entity<any>, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>> {
  findById: <O extends FindOptions<R>>(id: T['id'], options?: O) => FindResult<T, R, O> | null
  save: (entities: EntityWithOptionalRelations<T, R>[]) => void
  query: () => Query<T, R>
}

type RelationKind = 'one' | 'many'

interface Field {
  zodType: ZodNumber | ZodString
  name: string
}

interface Relation<K extends RelationKind = RelationKind, E extends Entity<any> = Entity<any>> {
  kind: K
  field: Field
  reference: {
    entity: E
    field: Field
  }
}

interface HasOneOptions {
  reference: Field
  field: Field
}

interface HasManyOptions {
  reference: Field
  field: Field
}

function one<E extends Entity<any>>(entity: E, { reference, field }: HasOneOptions): Relation<'one', E> {
  return {
    kind: 'one',
    field,
    reference: {
      entity,
      field: reference,
    },
  }
}

function many<E extends Entity<any>>(entity: E, { reference, field }: HasManyOptions): Relation<'many', E> {
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

type Relations<R extends Record<never, Relation>> = (options: RelationsOptions) => R

interface Signal {
  depend: () => void
  trigger: () => void
}

type ProxyValue<T extends object> = (string extends keyof T ? T[keyof T & string] : any) | (symbol extends keyof T ? T[keyof T & symbol] : any)

let db: Database = new DefaultDatabase()

export function getDb(): Database {
  return db
}

export function defineReactivityDatabase(database: Database): void {
  db = database
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

export function defineEntity<N extends string, S extends ZodSchemaWithId>(name: N, schema: S): Entity<S> {
  const fields = Object.entries(schema.shape).reduce((acc, [key, value]) => {
    acc[key as keyof S['shape']] = {
      zodType: value,
      name: key,
    } as ShapeToFields<S>[keyof S['shape']]
    return acc
  }, {} as ShapeToFields<S>)

  db.registerEntity(name)

  return { name, fields, zodSchema: schema } satisfies Entity<S>
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
}: LoadRelationsOptions<T, R>): T & Partial<RelationsToType<R>> {
  const entityWithRelations = { ...entity } as T & Partial<RelationsToType<R>>

  for (const relationName of relationsToLoad) {
    const relation = relations[relationName] as Relation
    if (!relation) {
      throw new Error(`Relation ${String(relationName)} not found on entity ${entityName}`)
    }

    const refEntityName = relation.reference.entity.name
    const refDb = db.getAll(refEntityName)

    const arrayFunc: 'filter' | 'find' = relation.kind === 'many' ? 'filter' : 'find'

    // @ts-expect-error can't valid the type between ObjectWithId and the relation type
    entityWithRelations[relationName] = refDb[arrayFunc]((value: ObjectWithId) => {
      return value[relation.reference.field.name as keyof ObjectWithId] === entity[relation.field.name as keyof ObjectWithId]
    })
  }

  return entityWithRelations
}

export function defineQueryBuilder<E extends Entity<ZodSchemaWithId>, T extends z.infer<E['zodSchema']>, R extends Record<never, Relation>>(
  entity: E,
  relationsFn?: Relations<R>,
): QueryBuilder<E, T, R> {
  const relations = relationsFn?.({ one, many }) || {} as R
  const relationsNames = Object.keys(relations)

  function save(_entities: EntityWithOptionalRelations<T, R>[]): void {
    for (const e of _entities) {
      db.setEntity(entity.name, { id: e.id })

      for (const key of Object.keys(e)) {
        if (relationsNames.includes(key)) {
          // @ts-expect-error key is a string, but we can use it to index the object
          const relation = relations[key] as Relation

          const refEntityName = relation.reference.entity.name
          // @ts-expect-error key is a string, but we can use it to index the object
          const relationObject = e[key]! as ObjectWithId | ObjectWithId[]

          // Handle array relations (many)
          if (Array.isArray(relationObject)) {
            for (const refEntity of relationObject) {
              db.setEntity(refEntityName, relation.reference.entity.zodSchema.parse(refEntity))
            }
          }
          // Handle single relations (one)
          else {
            db.setEntity(refEntityName, relation.reference.entity.zodSchema.parse(relationObject))
          }
        }
        // else handle regular properties
        else {
          const k = key as keyof ShapeToFields<ZodSchemaWithId>
          db.setEntityKey(entity.name, e.id, k, entity.fields[k].zodType.parse(e[k]))
        }
      }
    }
  }

  function findById<O extends FindOptions<R>>(id: T['id'], options?: O): FindResult<T, R, O> | null {
    const foundEntity = db.getEntity(entity.name, id) as T

    if (!foundEntity) {
      return null
    }

    if (options?.with && options.with.length > 0) {
      return loadRelations({
        entity: foundEntity,
        relations,
        relationsToLoad: options.with,
        entityName: entity.name,
      }) as FindResult<T, R, O>
    }

    return foundEntity as FindResult<T, R, O>
  }

  const queryWhereFilters: Array<(arr: T[]) => T[]> = []
  const queryOrWhereFilters: Array<(arr: T[]) => T[]> = []
  const queryRelationsToLoad: (keyof R)[] = []
  const queryOrderBy: { criteria: OrderByCriteria<T>, orders: OrderByOrders } = { criteria: [], orders: [] }

  function resetQuery(): void {
    queryWhereFilters.length = 0
    queryOrWhereFilters.length = 0
    queryRelationsToLoad.length = 0
    queryOrderBy.criteria.length = 0
    queryOrderBy.orders.length = 0
  }

  type QueryResult = FindResult<T, R, { with: (keyof R)[] }>

  function query(): Query<T, R> {
    return {
      where: (cb): Query<T, R> => {
        queryWhereFilters.push(arr => arr.filter(cb))
        return query()
      },
      orWhere: (cb): Query<T, R> => {
        queryOrWhereFilters.push(arr => arr.filter(cb))
        return query()
      },
      with: (relation): Query<T, R> => {
        if (!relationsNames.includes(relation as string)) {
          throw new Error(`Relation ${String(relation)} not found on entity ${entity.name}`)
        }

        queryRelationsToLoad.push(relation)
        return query()
      },
      orderBy: (criteria, orders): Query<T, R> => {
        queryOrderBy.criteria = criteria
        queryOrderBy.orders = orders
        return query()
      },
      get: (): QueryResult[] => {
        let result = db.getAll(entity.name) as T[]

        if (queryOrWhereFilters.length > 0 && queryWhereFilters.length === 0) {
          throw new Error('Cannot use orWhere without where')
        }

        if (queryWhereFilters.length > 0) {
          result = queryWhereFilters.reduce((acc, filter) => filter(acc), result)
        }

        if (queryOrWhereFilters.length > 0) {
          const orResults = queryOrWhereFilters.flatMap(filter => filter(db.getAll(entity.name) as T[]))
          result = [...new Set([...result, ...orResults])]
        }

        if (queryOrderBy.criteria.length > 0) {
          result = result.sort(orderBy(queryOrderBy))
        }

        if (queryRelationsToLoad.length > 0) {
          result = result.map((e) => {
            const withRelations = loadRelations({
              entity: e,
              relations,
              relationsToLoad: queryRelationsToLoad,
              entityName: entity.name,
            })
            return withRelations as QueryResult
          })
        }

        resetQuery()

        return result as QueryResult[]
      },
    }
  }

  return {
    findById,
    save,
    query,
  }
}
