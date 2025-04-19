import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { Database } from './database'
import type { OrderByCriteria, OrderByOrders } from './orderBy'
import type { ExactDeep, Prettify } from './types'
import { DefaultDatabase } from './database'
import { orderBy } from './orderBy'

interface ZodSchemaWithId extends ZodObject<{ id: ZodNumber | ZodString }> {}
export interface ObjectWithId extends z.infer<ZodSchemaWithId> {}

type ShapeToFields<S extends ZodObject<{ id: ZodNumber | ZodString }>> = {
  [K in keyof S['shape']]: {
    zodType: S['shape'][K]
    name: K
  }
}

interface Entity<N extends string, S extends ZodSchemaWithId> {
  zodSchema: S
  name: N
  fields: ShapeToFields<S>
}

type AnyEntity = Entity<string, ZodSchemaWithId>

type RelationKind = 'one' | 'many'

interface Field {
  zodType: ZodNumber | ZodString
  name: string
}

interface Relation<K extends RelationKind = RelationKind, E extends AnyEntity = AnyEntity> {
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

function one<E extends AnyEntity>(entity: E, { reference, field }: RelationOptions): Relation<'one', E> {
  return {
    kind: 'one',
    field,
    reference: {
      entity,
      field: reference,
    },
  }
}

function many<E extends AnyEntity>(entity: E, { reference, field }: RelationOptions): Relation<'many', E> {
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

let db: Database = new DefaultDatabase()

export function getDb(): Database {
  return db
}

export function defineReactivityDatabase(database: Database): void {
  db = database
}

export function defineEntity<N extends string, S extends ZodSchemaWithId>(name: N, schema: S): Entity<N, S> {
  const fields = Object.entries(schema.shape).reduce((acc, [key, value]) => {
    acc[key as keyof S['shape']] = {
      zodType: value,
      name: key,
    } as ShapeToFields<S>[keyof S['shape']]
    return acc
  }, {} as ShapeToFields<S>)

  db.registerEntity(name)

  return { name, fields, zodSchema: schema }
}

export type ActualRelations<E extends AnyEntity, R extends Relations<any>> = {
  [K in keyof R[E['name']]]: R[E['name']][K] extends Relation<'one', infer RE>
    ? EntityWithOptionalRelations<RE, R>
    : R[E['name']][K] extends Relation<'many', infer RE>
      ? Array<EntityWithOptionalRelations<RE, R>>
      : never
}

export type EntityWithOptionalRelations<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId = z.infer<E['zodSchema']>> =
  keyof R[E['name']] extends never
    ? T
    : Prettify<T & Partial<ActualRelations<E, R>>>

interface LoadRelationsOptions<E extends AnyEntity, R extends Relations<any>, RL extends WithRelationsOption<E, R>, T extends z.infer<E['zodSchema']>> {
  entityData: T
  relations: R
  relationsToLoad: RL
  entity: E
}

function loadRelations<E extends AnyEntity, R extends Relations<any>, RL extends WithRelationsOption<E, R>, T extends z.infer<E['zodSchema']> = z.infer<E['zodSchema']>>({
  entityData,
  relations,
  relationsToLoad,
  entity,
}: LoadRelationsOptions<E, R, RL, T>): Prettify<T & TypeOfRelations<E, R, RL>> {
  const entityWithRelations = { ...entityData } as Prettify<T & TypeOfRelations<E, R, RL>>
  const myRelations = relations[entity.name] || {}

  for (const [relationName, relationValue] of Object.entries(relationsToLoad) as Array<[string, boolean | undefined | Record<string, boolean>]>) {
    if (!relationValue) {
      continue
    }

    const relation = myRelations[relationName] as Relation

    if (!relation) {
      throw new Error(`Relation ${String(relationName)} not found on entity ${entity.name}`)
    }

    const refEntity = relation.reference.entity
    const refDb = db.getAll(refEntity.name)

    const arrayFunc: 'filter' | 'find' = relation.kind === 'many' ? 'filter' : 'find'

    // @ts-expect-error can't valid the type between ObjectWithId and the relation type
    entityWithRelations[relationName] = refDb[arrayFunc]((value: ObjectWithId) => {
      return value[relation.reference.field.name as keyof ObjectWithId] === entityData[relation.field.name as keyof ObjectWithId]
    })

    if (typeof relationValue === 'object') {
      if (relation.kind === 'many') {
        // @ts-expect-error can't valid the type between ObjectWithId and the relation type
        entityWithRelations[relationName] = entityWithRelations[relationName].map((value: T) => {
          return loadRelations({
            entityData: value,
            relations,
            relationsToLoad: relationValue as WithRelationsOption<E, R>,
            entity: refEntity,
          })
        })
      }
      else {
        // @ts-expect-error can't valid the type between ObjectWithId and the relation type
        entityWithRelations[relationName] = loadRelations({
          // @ts-expect-error can't valid the type between ObjectWithId and the relation type
          entityData: entityWithRelations[relationName],
          relations,
          relationsToLoad: relationValue as WithRelationsOption<E, R>,
          entity: refEntity,
        })
      }
    }
  }

  return entityWithRelations
}

type Relations<Names extends string> = Partial<Record<Names, Record<string, Relation>>>

export type WithRelationsOption<
  E extends AnyEntity,
  R extends Relations<any>,
  N extends string[] = [],
> = keyof R[E['name']] extends never
  ? never
  : {
      [K in keyof R[E['name']] as K extends N[number] ? never : K]?:
        | boolean
        | (R[E['name']][K] extends Relation<any, infer RE>
          ? WithRelationsOption<RE, R, [...N, E['name']]>
          : never)
    }

type GetNestedRelationType<
  E extends AnyEntity,
  R extends Relations<any>,
  O extends WithRelationsOption<E, R>,
  P extends boolean,
> = Prettify<z.infer<E['zodSchema']> & (
  P extends true
    ? Partial<TypeOfRelations<E, R, O, P>>
    : TypeOfRelations<E, R, O, P>
)>

export type TypeOfRelations<
  E extends AnyEntity,
  R extends Relations<any>,
  W extends WithRelationsOption<E, R>,
  P extends boolean = false,
> = {
  [K in keyof W]: K extends keyof R[E['name']] ?
    R[E['name']][K] extends Relation<infer RK, infer RE> ?
      W[K] extends true ?
        RK extends 'many' ? Array<z.infer<RE['zodSchema']>> : z.infer<RE['zodSchema']>
        : W[K] extends WithRelationsOption<RE, R> ?
          RK extends 'many' ?
            Array<GetNestedRelationType<RE, R, W[K], P>>
            : GetNestedRelationType<RE, R, W[K], P>
          : never
      : never
    : never
}

interface Query<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId = z.infer<E['zodSchema']>, Result = T> {
  where: (cb: (value: T) => boolean) => Query<E, R, T, Result>
  orWhere: (cb: (value: T) => boolean) => Query<E, R, T, Result>
  orderBy: (criteria: OrderByCriteria<T>, orders: OrderByOrders) => Query<E, R, T, Result>
  with: <W extends WithRelationsOption<E, R>>(relations: ExactDeep<W, WithRelationsOption<E, R>>) => Query<E, R, T, Prettify<Result & TypeOfRelations<E, R, W>>>
  get: () => Array<Result>
}

type RelationsFn<N extends string, R extends Relations<N>> = (options: RelationsOptions) => R

export type GetRelationEntitiesName<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>> =
  R[E['name']] extends Record<string, Relation> ?
    R[E['name']][keyof R[E['name']]] extends Relation<any, infer RE extends AnyEntity> ?
      RE['name']
      : never
    : never

interface FindByIdOptions<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>> { with?: WithRelationsOption<E, R> }

type FindByIdResult<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId, O extends FindByIdOptions<E, R>> =
  O extends { with: any } ? Prettify<T & TypeOfRelations<E, R, O['with']>> : T

interface QueryBuilder<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId = z.infer<E['zodSchema']>> {
  query: () => Query<E, R, T>
  findById: <O extends FindByIdOptions<E, R>>(id: T['id'], options?: ExactDeep<O, FindByIdOptions<E, R>>) => FindByIdResult<E, R, T, O> | null
  save: (entities: Array<EntityWithOptionalRelations<E, R, T>>) => void
}

type GlobalQueryBuilder<E extends Array<Entity<string, ZodSchemaWithId>>, N extends E[number]['name'], R extends Relations<N>> = {
  [K in N]: QueryBuilder<Extract<E[number], { name: K }>, R>
}

function parseAndSaveEntity<E extends Entity<any, any>>(
  { entity, data, relations }: {
    entity: E
    data: ObjectWithId
    relations: Relations<any>
  },
): void {
  const myRelations = relations[entity.name] || {}
  const relationsNames = Object.keys(myRelations)

  db.setEntity(entity.name, { id: data.id })

  for (const key of Object.keys(data)) {
    if (relationsNames.includes(key)) {
      const relation = myRelations[key] as Relation

      // @ts-expect-error key is a string, but we can use it to index the object
      const relationObject = data[key]! as ObjectWithId | ObjectWithId[]

      // Handle array relations (many)
      if (Array.isArray(relationObject)) {
        for (const refEntity of relationObject) {
          parseAndSaveEntity({ entity: relation.reference.entity, data: refEntity, relations })
        }
      }
      // Handle single relations (one)
      else {
        parseAndSaveEntity({ entity: relation.reference.entity, data: relationObject, relations })
      }
    }
    // else handle regular properties
    else {
      const k = key as keyof ShapeToFields<ZodSchemaWithId>

      if (!entity.fields[k]) {
        throw new Error(`Field ${k} not found on entity ${entity.name}`)
      }

      db.setEntityKey(entity.name, data.id, k, entity.fields[k].zodType.parse(data[k]))
    }
  }
}

function defineEntityQueryBuilder<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends z.infer<E['zodSchema']>>(entity: E, relations: R): QueryBuilder<E, R, T> {
  function save(entities: Array<EntityWithOptionalRelations<E, R, T>>): void {
    for (const e of entities) {
      parseAndSaveEntity({ entity, data: e, relations })
    }
  }

  function findById<O extends FindByIdOptions<E, R>>(id: T['id'], options?: ExactDeep<O, FindByIdOptions<E, R>>): FindByIdResult<E, R, T, O> | null {
    const entityData = db.getEntity(entity.name, id) as T | null

    if (!entityData) {
      return null
    }

    if (options?.with && Object.keys(options.with).length > 0) {
      return loadRelations({
        entityData,
        relations,
        relationsToLoad: options.with as WithRelationsOption<E, R>,
        entity,
      }) as FindByIdResult<E, R, T, O>
    }

    return entityData as FindByIdResult<E, R, T, O>
  }

  const queryWhereFilters: Array<(arr: T[]) => T[]> = []
  const queryOrWhereFilters: Array<(arr: T[]) => T[]> = []
  const queryRelationsToLoad: Array<WithRelationsOption<E, R>> = []

  const queryOrderBy: { criteria: OrderByCriteria<T>, orders: OrderByOrders } = { criteria: [], orders: [] }

  function resetQuery(): void {
    queryWhereFilters.length = 0
    queryOrWhereFilters.length = 0
    queryOrderBy.criteria.length = 0
    queryOrderBy.orders.length = 0
    queryRelationsToLoad.length = 0
  }

  function query(): Query<E, R, T> {
    return {
      where: (cb): Query<E, R, T> => {
        queryWhereFilters.push(arr => arr.filter(cb))
        return query()
      },
      orWhere: (cb): Query<E, R, T> => {
        queryOrWhereFilters.push(arr => arr.filter(cb))
        return query()
      },
      orderBy: (criteria, orders): Query<E, R, T> => {
        queryOrderBy.criteria = criteria
        queryOrderBy.orders = orders
        return query()
      },
      // @ts-expect-error can't valid the return type as it should add the relations type to the query result
      with: (relation): Query<E, R, T> => {
        queryRelationsToLoad.push(relation as WithRelationsOption<E, R>)
        return query()
      },
      get: (): T[] => {
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
          const relationsToLoad = queryRelationsToLoad.reduce((acc, relation) => ({ ...acc, ...relation }), {} as WithRelationsOption<E, R>)

          result = result.map(d => loadRelations({
            entityData: d,
            relations,
            relationsToLoad,
            entity,
          }))
        }

        resetQuery()

        return result
      },
    }
  }

  return { save, findById, query }
}

export function defineQueryBuilder<
  E extends Array<Entity<string, ZodSchemaWithId>>,
  N extends E[number]['name'],
  R extends Relations<N>,
>(entities: E, relationsFn?: RelationsFn<N, R>): GlobalQueryBuilder<E, N, R> {
  const relations = relationsFn?.({ one, many }) || {} as R

  return entities.reduce((acc, entity) => {
    // @ts-expect-error can't valid the type between Entity and the key of the global query builder
    acc[entity.name] = defineEntityQueryBuilder(entity, relations)
    return acc
  }, {} as GlobalQueryBuilder<E, N, R>)
}
