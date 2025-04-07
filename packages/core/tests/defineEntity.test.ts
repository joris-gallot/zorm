import { assertType, describe, it } from 'vitest'
import { z } from 'zod'
import { defineEntity } from '../src/orm'

describe('defineEntity', () => {
  it('should return a typed entity', () => {
    const _User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      age: z.number().nullable(),
    }))

    assertType<typeof _User>(
      {
        zodSchema: z.object({
          id: z.number(),
          name: z.string(),
          age: z.number().nullable(),
        }),
        name: 'user',
        fields: {
          id: {
            zodType: z.number(),
            name: 'id',
          },
          name: {
            zodType: z.string(),
            name: 'name',
          },
          age: {
            zodType: z.number().nullable(),
            name: 'age',
          },
        },
      },
    )
  })

  it('should have a tsc error if id is missing', () => {
    const _EntityWithId = defineEntity('entityWithId', z.object({ id: z.number() }))

    // @ts-expect-error id is missing
    const _EntityWihoutId = defineEntity('entityWithoutId', z.object({ name: z.string() }))

    // @ts-expect-error entity must have an id field
    const _EntityWithNumber = defineEntity('entityWithNumber', z.number())

    // @ts-expect-error entity must have an id field
    const _EntityWithString = defineEntity('entityWithString', z.string())

    // @ts-expect-error entity must have an id field
    const _EntityWithBoolean = defineEntity('entityWithBoolean', z.boolean())
  })
})
