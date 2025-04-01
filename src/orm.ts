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

interface Entity<S extends ZodSchemaWithId> {
  zodSchema: S
  name: string
  fields: ShapeToFields<S>
}

interface QueryBuilder<E extends Entity<any>, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>> {
  findById: (id: T['id'], options?: FindOptions<R>) => FindResult<T, R, FindOptions<R>> | null
  save: (entities: EntityWithOptionalRelations<T, R>[]) => void
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

export const db: Record<string, Record<ObjectWithId['id'], ObjectWithId>> = {}

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

          if (!relation) {
            throw new Error(`Relation ${key} not found on entity ${entity.name}`)
          }

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
    const foundEntity: ObjectWithId = structuredClone(db[entity.name]![id])

    if (!foundEntity) {
      return null
    }

    if (options?.with && options.with.length > 0) {
      for (const _refName of options.with) {
        const refName = String(_refName)
        // @ts-expect-error refName is a string, but we can use it to index the object
        const relation = relations[refName] as Relation

        if (!relation) {
          throw new Error(`Relation ${refName} not found on entity ${entity.name}`)
        }

        const refDb = structuredClone(db[relation.reference.entity.name])

        if (!refDb) {
          throw new Error(`Database for entity ${relation.reference.entity.name} not found`)
        }

        // if relation is hasMany, use filter to get all related entities
        // if relation is hasOne, use find to get the related entity
        const arrayFunc: 'filter' | 'find' = relation.kind === 'many' ? 'filter' : 'find'

        // @ts-expect-error refName is a string, but we can use it to index the object
        foundEntity[refName] = Object.values(refDb)[arrayFunc]((value: ObjectWithId) => {
          return value[relation.reference.field.name as keyof ObjectWithId] === foundEntity[relation.field.name as keyof ObjectWithId]
        })
      }
    }

    return foundEntity as FindResult<T, R, O> | null
  }

  return {
    findById,
    save,
  } satisfies QueryBuilder<E, T, R>
}
