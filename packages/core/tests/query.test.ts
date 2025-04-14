import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('query', () => {
  it('should valid types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const query = defineQueryBuilder([User]).user.query()

    assertType<typeof query>(
      {
        where: () => query,
        orWhere: () => query,
        get: () => [],
        with: () => query,
        orderBy: () => query,
      },
    )
  })

  it('should return all users', () => {
    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const queryBuilder = defineQueryBuilder([User])

    queryBuilder.user.save([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }])

    const users = queryBuilder.user.query().get()
    expect(users).toEqual([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }])
  })
})
