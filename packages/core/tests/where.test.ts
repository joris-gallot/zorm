import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('where', () => {
  it('should valid types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      isAdmin: z.boolean().optional(),
      age: z.number().nullable(),
    }))

    const userQuery = defineQueryBuilder(User)

    const _users = userQuery.query()
      .where('name', '=', 'John')
      .where('id', '>', 10)
      .where('isAdmin', '=', true)
      .where('age', '=', null)
      // @ts-expect-error invalid value
      .where('age', '!=', undefined)
      .where('isAdmin', '!=', undefined)
      // @ts-expect-error invalid operator
      .where('isAdmin', 'is', true)
      // @ts-expect-error invalid operator
      .where('isAdmin', '', true)
      // @ts-expect-error invalid field
      .where('foo', '=', 'bar')
      // @ts-expect-error invalid field
      .where('', '=', 'bar')
      // @ts-expect-error invalid value
      .where('isAdmin', '!=', null)
      // @ts-expect-error invalid value
      .where('isAdmin', '=', 'true')
      // @ts-expect-error invalid value
      .where('name', '=', 1)
      // @ts-expect-error invalid value
      .where('id', '=', true)
      .get()

    assertType<typeof _users>([{
      id: 1,
      name: 'John Doe',
      isAdmin: true,
      age: null,
    }])
  })

  describe('filter with operators', () => {
    it('number', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([{ id: 1, age: 10 }, { id: 2 }, { id: 3 }, { id: 4 }])

      /* = operator */
      const users = userQuery.query()
        .where('id', '=', 1)
        .get()

      expect(users).toEqual([{ id: 1, age: 10 }])

      /* != operator */
      const users2 = userQuery.query()
        .where('id', '!=', 1)
        .get()

      expect(users2).toEqual([{ id: 2 }, { id: 3 }, { id: 4 }])

      /* > operator */
      let users3 = userQuery.query()
        .where('id', '>', 2)
        .get()

      expect(users3).toEqual([{ id: 3 }, { id: 4 }])

      users3 = userQuery.query().where('age', '>=', 10).get()

      expect(users3).toEqual([{ id: 1, age: 10 }])

      /* < operator */
      const users4 = userQuery.query()
        .where('id', '<', 3)
        .get()

      expect(users4).toEqual([{ id: 1, age: 10 }, { id: 2 }])

      /* >= operator */
      const users5 = userQuery.query()
        .where('id', '>=', 2)
        .get()

      expect(users5).toEqual([{ id: 2 }, { id: 3 }, { id: 4 }])

      /* <= operator */
      const users6 = userQuery.query()
        .where('id', '<=', 3)
        .get()

      expect(users6).toEqual([{ id: 1, age: 10 }, { id: 2 }, { id: 3 }])
    })

    it('string', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([
        { id: 1, name: 'John' },
        { id: 2, name: 'Sarah' },
        { id: 3, name: 'Paul' },
        { id: 4, name: 'Emma' },
      ])

      /* = operator */
      const users = userQuery.query()
        .where('name', '=', 'John')
        .get()

      expect(users).toEqual([{ id: 1, name: 'John' }])

      /* != operator */
      const users2 = userQuery.query()
        .where('name', '!=', 'John')
        .get()

      expect(users2).toEqual([{ id: 2, name: 'Sarah' }, { id: 3, name: 'Paul' }, { id: 4, name: 'Emma' }])
    })

    it('boolean', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        isAdmin: z.boolean(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([
        { id: 1, isAdmin: true },
        { id: 2, isAdmin: false },
        { id: 3, isAdmin: true },
        { id: 4, isAdmin: false },
      ])

      /* = operator */
      const users = userQuery.query()
        .where('isAdmin', '=', true)
        .get()

      expect(users).toEqual([{ id: 1, isAdmin: true }, { id: 3, isAdmin: true }])

      /* != operator */
      const users2 = userQuery.query()
        .where('isAdmin', '!=', true)
        .get()

      expect(users2).toEqual([{ id: 2, isAdmin: false }, { id: 4, isAdmin: false }])
    })

    it('null', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string().nullable(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([
        { id: 1, name: 'John' },
        { id: 2, name: null },
        { id: 3, name: 'Zoe' },
        { id: 4, name: null },
        { id: 5, name: 'Paul' },
      ])

      /* = operator */
      const users = userQuery.query()
        .where('name', '=', null)
        .get()

      expect(users).toEqual([{ id: 2, name: null }, { id: 4, name: null }])

      /* != operator */
      const users2 = userQuery.query()
        .where('name', '!=', null)
        .get()

      expect(users2).toEqual([{ id: 1, name: 'John' }, { id: 3, name: 'Zoe' }, { id: 5, name: 'Paul' }])
    })

    it('undefined', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string().optional(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([
        { id: 1, name: 'John' },
        { id: 2, name: undefined },
        { id: 3, name: 'Doe' },
        { id: 4, name: undefined },
        { id: 5, name: 'Paul' },
      ])

      /* = operator */
      const users = userQuery.query()
        .where('name', '=', undefined)
        .get()

      expect(users).toEqual([{ id: 2, name: undefined }, { id: 4, name: undefined }])

      /* != operator */
      const users2 = userQuery.query()
        .where('name', '!=', undefined)
        .get()

      expect(users2).toEqual([{ id: 1, name: 'John' }, { id: 3, name: 'Doe' }, { id: 5, name: 'Paul' }])
    })
  })
})
