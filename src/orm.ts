import type { z, ZodNumber, ZodObject, ZodString } from 'zod'
import type { Simplify } from './types'
import { ref } from 'vue'

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
    [K in T]: R[K] extends Relation<infer K extends RelationKind, infer E extends Entity> ?
      K extends 'hasMany' ? Array<z.infer<E['zodSchema']>> : z.infer<E['zodSchema']>
      : never
  }

type FindResult<T, R extends Record<never, Relation>, O extends FindOptions<R>> = O extends { with: Array<infer U extends keyof R> } ? Simplify<T & WithRelations<R, U>> : T

interface Entity<S extends ZodSchemaWithId = ZodSchemaWithId> {
  zodSchema: S
  name: string
  fields: ShapeToFields<S>
}

interface QueryBuilder<E extends Entity, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>, TR = Simplify<T & Partial<WithRelations<R>>>> {
  find: (id: T['id'], options?: FindOptions<R>) => FindResult<T, R, FindOptions<R>>
  save: (entities: TR[]) => void
}

type RelationKind = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany'

interface Field {
  zodType: ZodNumber | ZodString
  name: string
}

interface Relation<K extends RelationKind = RelationKind, E extends Entity = Entity> {
  kind: K
  relationName: string
  field: Field
  reference: {
    entity: E['zodSchema']
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

function hasOne<E extends Entity<any>>(entity: E, { reference, field }: HasOneOptions): Relation<'hasOne', E> {
  return {
    kind: 'hasOne',
    field,
    reference: {
      entity,
      field: reference,
    },
    relationName: 'relationName',
  }
}

function hasMany<E extends Entity<any>>(entity: E, { reference, field }: HasManyOptions): Relation<'hasMany', E> {
  return {
    kind: 'hasMany',
    field,
    reference: {
      entity,
      field: reference,
    },
    relationName: 'relationName',
  }
}

interface RelationsOptions {
  hasOne: typeof hasOne
  hasMany: typeof hasMany
}

type Relations<R extends Record<never, Relation>> = (options: RelationsOptions) => R

export function defineEntity<N extends string, S extends ZodSchemaWithId>(name: N, schema: S) {
  const fields = Object.entries(schema.shape).reduce((acc, [key, value]) => {
    acc[key as keyof S['shape']] = {
      zodType: value,
      name: key,
    } as ShapeToFields<S>[keyof S['shape']]
    return acc
  }, {} as ShapeToFields<S>)

  return { name, fields, zodSchema: schema } satisfies Entity<S>
}

export function defineQueryBuilder<E extends Entity, T extends z.infer<E['zodSchema']>, R extends Record<string, Relation>, TR = Simplify<T & Partial<WithRelations<R>>>>(
  entity: E,
  relationsFn: Relations<R>,
) {
  const data = ref<Record<number | string, TR>>({})

  // eslint-disable-next-line unused-imports/no-unused-vars
  const relations = relationsFn({ hasOne, hasMany })

  function save(_entities: TR[]) {
    _entities.forEach((e) => {
      data.value[e.id] = e
    })
  }

  function find<O extends FindOptions<R>>(id: T['id'], options?: O): FindResult<T, R, O> {
    const entity = data.value[id]

    if (!entity) {
      throw new Error(`Entity ${entity.name} with id ${id} not found`)
    }

    if (options?.with) {
      // TODO: Implement
    }

    return entity as FindResult<T, R, O>
  }

  return {
    find,
    save,
  } satisfies QueryBuilder<E, T, R, TR>
}
