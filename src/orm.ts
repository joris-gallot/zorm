import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { Simplify } from './types'

interface ZodSchemaWithId extends ZodObject<{ id: ZodNumber | ZodString }, any, any> {}

type ShapeToFields<S extends ZodObject<{ id: ZodNumber | ZodString }, any, any>> = {
  [K in keyof S['shape']]: {
    zodType: S['shape'][K]
    name: K
  }
}

interface FindOptions<R extends Record<never, Relation>> { with?: Array<keyof R> }

type WithRelations<R extends Record<string, Relation>, T extends keyof R = keyof R> =
  {
    [K in T]: R[K] extends Relation<infer K extends RelationKind, infer E extends Entity<any>> ?
      K extends 'many' ? Array<z.infer<E['zodSchema']>> : z.infer<E['zodSchema']>
      : never
  }

type FindResult<T, R extends Record<never, Relation>, O extends FindOptions<R>> = O extends { with: Array<infer U extends keyof R> } ? Simplify<T & WithRelations<R, U>> : T

interface Entity<S extends ZodSchemaWithId> {
  zodSchema: S
  name: string
  fields: ShapeToFields<S>
}

interface QueryBuilder<E extends Entity<any>, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>, TR = Simplify<T & Partial<WithRelations<R>>>> {
  findById: (id: T['id'], options?: FindOptions<R>) => FindResult<T, R, FindOptions<R>>
  save: (entities: TR[]) => void
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

const db: Record<string, Record<number | string, any>> = {}

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

export function defineQueryBuilder<E extends Entity<ZodSchemaWithId>, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>, TR extends T & Simplify<Partial<WithRelations<R>>>>(
  entity: E,
  relationsFn?: Relations<R>,
) {
  const relations = relationsFn?.({ one, many }) || {} as R

  const relationsNames = Object.keys(relations)

  function save(_entities: TR[]) {
    for (const e of _entities) {
      db[entity.name]![e.id] = {}

      for (const key of Object.keys(e)) {
        if (relationsNames.includes(key)) {
          const relation = relations[key]

          if (!relation) {
            throw new Error(`Relation ${key} not found on entity ${entity.name}`)
          }

          const refEntityName = relation.reference.entity.name

          // Handle array relations (hasMany)
          if (Array.isArray(e[key])) {
            for (const refEntity of e[key]) {
              // TODO: parse zod schema
              db[refEntityName]![refEntity.id] = refEntity
            }
          }
          else {
            // TODO: for non-array relations (hasOne)
          }
        }
        // else handle regular properties
        else {
          const k = key as keyof ShapeToFields<ZodSchemaWithId>
          db[entity.name]![e.id][k] = entity.fields[k].zodType.parse(e[k])
        }
      }
    }
  }

  function findById<O extends FindOptions<R>>(id: T['id'], options?: O): FindResult<T, R, O> {
    const foundEntity = structuredClone(db[entity.name]![id])

    if (!foundEntity) {
      throw new Error(`Entity ${entity.name} with id ${id} not found`)
    }

    if (options?.with && options.with.length > 0) {
      for (const _refName of options.with) {
        const refName = String(_refName)
        const relation = relations[refName]

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

        foundEntity[refName] = Object.values(refDb)[arrayFunc]((value) => {
          return value[relation.reference.field.name] === foundEntity[relation.field.name]
        })
      }
    }

    return foundEntity as FindResult<T, R, O>
  }

  return {
    findById,
    save,
  } satisfies QueryBuilder<E, T, R, TR>
}
