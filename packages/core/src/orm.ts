import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { Simplify } from './types'

interface ZodSchemaWithId extends ZodObject<{ id: ZodNumber | ZodString }, any, any> {}
interface ObjectWithId { id: number | string }

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

type QueryOperator = '=' | '!=' | '>' | '<' | '>=' | '<='

type OperatorFunction<T extends ObjectWithId, P extends keyof T = keyof T> = (a: T[P], b: T[P]) => boolean
function getOperatorFunction<T extends ObjectWithId>(operator: QueryOperator) {
  const operatorsMap: Record<QueryOperator, OperatorFunction<T>> = {
    '=': (a, b) => a === b,
    '!=': (a, b) => a !== b,
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
  }

  return operatorsMap[operator]
}

type StringQueryOperator = Extract<QueryOperator, '=' | '!='>
type NumberQueryOperator = Extract<QueryOperator, '=' | '!=' | '>' | '<' | '>=' | '<='>
type BooleanQueryOperator = Extract<QueryOperator, '=' | '!='>
type NullQueryOperator = Extract<QueryOperator, '=' | '!='>
type UndefinedQueryOperator = Extract<QueryOperator, '=' | '!='>

type PrimitiveQueryOperator<Field> = Field extends string ?
  StringQueryOperator : Field extends number ?
    NumberQueryOperator : Field extends boolean ?
      BooleanQueryOperator : Field extends null ?
        NullQueryOperator : Field extends undefined ?
          UndefinedQueryOperator : never

interface Query<T extends ObjectWithId, R extends Record<never, Relation>> {
  where: <F extends keyof T, FType extends T[F]>(field: F, operator: PrimitiveQueryOperator<FType>, value: FType) => Query<T, R>
  orWhere: <F extends keyof T, FType extends T[F]>(field: F, operator: PrimitiveQueryOperator<FType>, value: FType) => Query<T, R>
  with: (relation: keyof R) => Query<T, R>
  get: () => Array<FindResult<T, R, { with: (keyof R)[] }>>
}

interface Entity<S extends ZodSchemaWithId> {
  zodSchema: S
  name: string
  fields: ShapeToFields<S>
}

interface QueryBuilder<E extends Entity<any>, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>> {
  findById: (id: T['id'], options?: FindOptions<R>) => FindResult<T, R, FindOptions<R>> | null
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

let db: Record<string, Record<ObjectWithId['id'], ObjectWithId>> = {}

export function getDb() {
  return db
}

export function defineReactivityAdapter(signalFactory: () => Signal) {
  db = createReactiveProxy(db, signalFactory())
}

function createReactiveProxy<T extends object>(target: T, signal: Signal): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      signal.depend()

      return typeof value === 'object' && value !== null ? createReactiveProxy(value, signal) : value
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver)
      signal.trigger()
      return result
    },
  })
}

export function defineEntity<N extends string, S extends ZodSchemaWithId>(name: N, schema: S) {
  const fields = Object.entries(schema.shape).reduce((acc, [key, value]) => {
    acc[key as keyof S['shape']] = {
      zodType: value,
      name: key,
    } as ShapeToFields<S>[keyof S['shape']]
    return acc
  }, {} as ShapeToFields<S>)

  db[name] = {}

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

    const refDb = { ...db[relation.reference.entity.name] }
    const arrayFunc: 'filter' | 'find' = relation.kind === 'many' ? 'filter' : 'find'

    // @ts-expect-error can't valid the type between ObjectWithId and the relation type
    entityWithRelations[relationName] = Object.values(refDb)[arrayFunc]((value: ObjectWithId) => {
      return value[relation.reference.field.name as keyof ObjectWithId] === entity[relation.field.name as keyof ObjectWithId]
    })
  }

  return entityWithRelations
}

export function defineQueryBuilder<E extends Entity<ZodSchemaWithId>, T extends z.infer<E['zodSchema']>, R extends Record<never, Relation>>(
  entity: E,
  relationsFn?: Relations<R>,
) {
  const relations = relationsFn?.({ one, many }) || {} as R
  const relationsNames = Object.keys(relations)

  function save(_entities: EntityWithOptionalRelations<T, R>[]) {
    for (const e of _entities) {
      db[entity.name]![e.id] = { id: e.id }

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
              db[refEntityName]![refEntity.id] = relation.reference.entity.zodSchema.parse(refEntity)
            }
          }
          // Handle single relations (one)
          else {
            db[refEntityName]![relationObject.id] = relation.reference.entity.zodSchema.parse(relationObject)
          }
        }
        // else handle regular properties
        else {
          const k = key as keyof ShapeToFields<ZodSchemaWithId>
          db[entity.name]![e.id]![k] = entity.fields[k].zodType.parse(e[k])
        }
      }
    }
  }

  function findById<O extends FindOptions<R>>(id: T['id'], options?: O): FindResult<T, R, O> | null {
    const dbEntity = db[entity.name]!
    const foundEntity = { ...dbEntity[id] } as T

    if (!Object.keys(foundEntity).length) {
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

  const whereFilters: Array<(arr: T[]) => T[]> = []
  const orWhereFilters: Array<(arr: T[]) => T[]> = []
  const relationsToLoad: (keyof R)[] = []

  type QueryResult = FindResult<T, R, { with: (keyof R)[] }>

  function query(): Query<T, R> {
    return {
      where: (field, operator, value) => {
        whereFilters.push(arr => arr.filter((item) => {
          const operatorFunction = getOperatorFunction<T>(operator)
          return operatorFunction(item[field], value)
        }))
        return query()
      },
      orWhere: (field, operator, value) => {
        orWhereFilters.push(arr => arr.filter((item) => {
          const operatorFunction = getOperatorFunction<T>(operator)
          return operatorFunction(item[field], value)
        }))

        return query()
      },
      with: (relation) => {
        if (!relationsNames.includes(relation as string)) {
          throw new Error(`Relation ${String(relation)} not found on entity ${entity.name}`)
        }

        relationsToLoad.push(relation)
        return query()
      },
      get: () => {
        const dbEntity = db[entity.name]!
        let result = Object.values(dbEntity) as T[]

        if (orWhereFilters.length > 0 && whereFilters.length === 0) {
          throw new Error('Cannot use orWhere without where')
        }

        if (whereFilters.length > 0) {
          result = whereFilters.reduce((acc, filter) => filter(acc), result)
        }

        if (orWhereFilters.length > 0) {
          const orResults = orWhereFilters.flatMap(filter => filter(Object.values(dbEntity) as T[]))
          result = [...new Set([...result, ...orResults])]
        }

        if (relationsToLoad.length > 0) {
          result = result.map((e) => {
            const withRelations = loadRelations({
              entity: e,
              relations,
              relationsToLoad,
              entityName: entity.name,
            })
            return withRelations as QueryResult
          })
        }

        relationsToLoad.length = 0
        whereFilters.length = 0
        orWhereFilters.length = 0

        return result as QueryResult[]
      },
    }
  }

  return {
    findById,
    save,
    query,
  } satisfies QueryBuilder<E, T, R>
}
