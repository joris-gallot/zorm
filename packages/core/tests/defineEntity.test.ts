import { assertType, describe, expect, it } from 'vitest'
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

    expect(() => {
      // @ts-expect-error entity must have an id field
      defineEntity('entityWithNumber', z.number())
    }).toThrow()

    expect(() => {
      // @ts-expect-error entity must have an id field
      defineEntity('entityWithString', z.string())
    }).toThrow()

    expect(() => {
      // @ts-expect-error entity must have an id field
      defineEntity('entityWithBoolean', z.boolean())
    }).toThrow()
  })
})
