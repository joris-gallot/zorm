import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { OrderByCriteria, OrderByOrders } from './orderBy'
import type { ExactDeep, Prettify } from './types'
import { orderBy } from './orderBy'

interface ZodSchemaWithId extends ZodObject<{ id: ZodNumber | ZodString }> {}
export interface ObjectWithId extends z.infer<ZodSchemaWithId> {}

type ShapeToFields<S extends ZodObject<{ id: ZodNumber | ZodString }>> = {
  [K in keyof S['shape']]: {
    zodType: S['shape'][K]
    name: K
  }
}

// TODO: remove this type
type _TypeOfRelations<R extends Record<never, Relation>, T extends keyof R = keyof R> =
    {
      [K in T]: R[K] extends Relation<infer K extends RelationKind, infer E extends AnyEntity> ?
        K extends 'many' ? Array<z.infer<E['zodSchema']>> : z.infer<E['zodSchema']>
        : never
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

export type EntityWithOptionalRelations<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends ObjectWithId = z.infer<E['zodSchema']>> =
  keyof R[E['name']] extends never ?
    T
    : Prettify<T & Partial<TypeOfRelations<E, R, DeepEntityRelationsOption<E, R>, true>>>

interface LoadRelationsOptions<T extends ObjectWithId, R extends Relations<any>> {
  entityData: T
  relations: R
  relationsToLoad: string[]
  entityName: string
}

function loadRelations<T extends ObjectWithId, R extends Relations<any>>({
  entityData,
  relations,
  relationsToLoad,
  entityName,
}: LoadRelationsOptions<T, R>): T & Partial<_TypeOfRelations<R>> {
  const entityWithRelations = { ...entityData } as T & Partial<_TypeOfRelations<R>>
  const myRelations = relations[entityName] || {}

  for (const relationName of relationsToLoad) {
    const relation = myRelations[relationName] as Relation

    if (!relation) {
      throw new Error(`Relation ${String(relationName)} not found on entity ${entityName}`)
    }

    const refEntityName = relation.reference.entity.name
    const refDb = db[refEntityName]

    const arrayFunc: 'filter' | 'find' = relation.kind === 'many' ? 'filter' : 'find'

    // @ts-expect-error can't valid the type between ObjectWithId and the relation type
    entityWithRelations[relationName] = Object.values(refDb || {})[arrayFunc]((value: ObjectWithId) => {
      return value[relation.reference.field.name as keyof ObjectWithId] === entityData[relation.field.name as keyof ObjectWithId]
    })
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
    ? Partial<TypeOfRelations<E, R, O>>
    : TypeOfRelations<E, R, O>
)>

export type TypeOfRelations<
  E extends AnyEntity,
  R extends Relations<any>,
  W extends WithRelationsOption<E, R>,
  P extends boolean = false,
> = {
  [K in keyof W]: W[K] extends true ?
    K extends keyof R[E['name']] ?
      R[E['name']][K] extends Relation<infer RK, infer RE> ?
        RK extends 'many' ? Array<z.infer<RE['zodSchema']>> : z.infer<RE['zodSchema']>
        : never
      : never
    : W[K] extends WithRelationsOption<any, R> ?
      K extends keyof R[E['name']] ?
        R[E['name']][K] extends Relation<infer RK, infer RE> ?
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

/**
 * - E is the entity type
 * - R is the global relations type
 * - N is an array of entity names used to avoid infinite recursion with relations references
 */
export type DeepEntityRelationsOption<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, N extends string[] = []> = keyof R[E['name']] extends never ? never : {
  [K in keyof R[E['name']] as K extends N[number] ? never : K]: R[E['name']][K] extends Relation<any, infer RE extends AnyEntity> ?
    keyof R[RE['name']] extends never ?
      true
      : DeepEntityRelationsOption<RE, R, [...N, E['name']]>
    : never
}

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

  db[entity.name]![data.id] = { id: data.id }

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

      db[entity.name]![data.id]![k] = entity.fields[k].zodType.parse(data[k])
    }
  }
}

function defineEntityQueryBuilder<E extends Entity<string, ZodSchemaWithId>, R extends Relations<any>, T extends z.infer<E['zodSchema']>>(entity: E, relations: R): QueryBuilder<E, R, T> {
  function save(entities: Array<EntityWithOptionalRelations<E, R, T>>): void {
    for (const e of entities) {
      parseAndSaveEntity({ entity, data: e, relations })
    }
  }

  function findById<O extends FindByIdOptions<E, R>>(id: T['id'], options?: O): FindByIdResult<E, R, T, O> | null {
    const dbEntity = db[entity.name]!
    const entityData = { ...dbEntity[id] } as T

    if (!Object.keys(entityData).length) {
      return null
    }

    if (options?.with && Object.keys(options.with).length > 0) {
      return loadRelations({
        entityData,
        relations,
        // TODO: get deep relations
        relationsToLoad: Object.keys(options.with),
        entityName: entity.name,
      }) as FindByIdResult<E, R, T, O>
    }

    return entityData as FindByIdResult<E, R, T, O>
  }

  function query(): Query<E, R, T> {
    return {
      where: () => query(),
      orWhere: () => query(),
      orderBy: () => query(),
      with: () => query(),
      get: () => [],
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
    acc[entity.name] = defineEntityQueryBuilder(entity, relations)
    return acc
  }, {} as GlobalQueryBuilder<E, N, R>)
}
