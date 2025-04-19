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

    const queryBuilder = defineQueryBuilder([User])

    const _users = queryBuilder.user.query()
      .where(user => user.name === 'John')
      .where(user => user.id > 10)
      .where(user => user.isAdmin === true)
      .where(user => user.age === null)
      .where(user => user.isAdmin !== undefined)
      // @ts-expect-error invalid field
      .where(user => user.foo === true)
      // @ts-expect-error invalid field
      .where(user => user.bar === 'bar')
      // @ts-expect-error invalid value
      .where(user => user.isAdmin === 'true')
      // @ts-expect-error invalid value
      .where(user => user.name === 1)
      // @ts-expect-error invalid value
      .where(user => user.id === true)
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

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([{ id: 1, age: 10 }, { id: 2 }, { id: 3 }, { id: 4 }])

      /* = operator */
      const users = queryBuilder.user.query()
        .where(user => user.id === 1)
        .get()

      expect(users).toEqual([{ id: 1, age: 10 }])
      assertType<Array<{ id: number, age?: number }>>(users)

      /* != operator */
      const users2 = queryBuilder.user.query()
        .where(user => user.id !== 1)
        .get()

      expect(users2).toEqual([{ id: 2 }, { id: 3 }, { id: 4 }])
      assertType<Array<{ id: number, age?: number }>>(users2)

      /* > operator */
      let users3 = queryBuilder.user.query()
        .where(user => user.id > 2)
        .get()

      expect(users3).toEqual([{ id: 3 }, { id: 4 }])
      assertType<Array<{ id: number, age?: number }>>(users3)

      // @ts-expect-error age is optional
      users3 = queryBuilder.user.query().where(user => user.age >= 10).get()

      expect(users3).toEqual([{ id: 1, age: 10 }])
      assertType<Array<{ id: number, age?: number }>>(users3)

      /* < operator */
      const users4 = queryBuilder.user.query()
        .where(user => user.id < 3)
        .get()

      expect(users4).toEqual([{ id: 1, age: 10 }, { id: 2 }])
      assertType<Array<{ id: number, age?: number }>>(users4)

      /* >= operator */
      const users5 = queryBuilder.user.query()
        .where(user => user.id >= 2)
        .get()

      expect(users5).toEqual([{ id: 2 }, { id: 3 }, { id: 4 }])
      assertType<Array<{ id: number, age?: number }>>(users5)

      /* <= operator */
      const users6 = queryBuilder.user.query()
        .where(user => user.id <= 3)
        .get()

      expect(users6).toEqual([{ id: 1, age: 10 }, { id: 2 }, { id: 3 }])
      assertType<Array<{ id: number, age?: number }>>(users6)
    })

    it('string', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: 'Sarah' },
        { id: 3, name: 'Paul' },
        { id: 4, name: 'Emma' },
      ])

      /* = operator */
      const users = queryBuilder.user.query()
        .where(user => user.name === 'John')
        .get()

      expect(users).toEqual([{ id: 1, name: 'John' }])
      assertType<Array<{ id: number, name: string }>>(users)

      /* != operator */
      const users2 = queryBuilder.user.query()
        .where(user => user.name !== 'John')
        .get()

      expect(users2).toEqual([{ id: 2, name: 'Sarah' }, { id: 3, name: 'Paul' }, { id: 4, name: 'Emma' }])
      assertType<Array<{ id: number, name: string }>>(users2)
    })

    it('boolean', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        isAdmin: z.boolean(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, isAdmin: true },
        { id: 2, isAdmin: false },
        { id: 3, isAdmin: true },
        { id: 4, isAdmin: false },
      ])

      /* = operator */
      const users = queryBuilder.user.query()
        .where(user => user.isAdmin === true)
        .get()

      expect(users).toEqual([{ id: 1, isAdmin: true }, { id: 3, isAdmin: true }])
      assertType<Array<{ id: number, isAdmin: boolean }>>(users)

      /* != operator */
      const users2 = queryBuilder.user.query()
        .where(user => user.isAdmin !== true)
        .get()

      expect(users2).toEqual([{ id: 2, isAdmin: false }, { id: 4, isAdmin: false }])
      assertType<Array<{ id: number, isAdmin: boolean }>>(users2)
    })

    it('null', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string().nullable(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: null },
        { id: 3, name: 'Zoe' },
        { id: 4, name: null },
        { id: 5, name: 'Paul' },
      ])

      /* = operator */
      const users = queryBuilder.user.query()
        .where(user => user.name === null)
        .get()

      expect(users).toEqual([{ id: 2, name: null }, { id: 4, name: null }])
      assertType<Array<{ id: number, name: string | null }>>(users)

      /* != operator */
      const users2 = queryBuilder.user.query()
        .where(user => user.name !== null)
        .get()

      expect(users2).toEqual([{ id: 1, name: 'John' }, { id: 3, name: 'Zoe' }, { id: 5, name: 'Paul' }])
      assertType<Array<{ id: number, name: string | null }>>(users2)
    })

    it('undefined', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: undefined },
        { id: 3, name: 'Doe' },
        { id: 4, name: undefined },
        { id: 5, name: 'Paul' },
      ])

      /* = operator */
      const users = queryBuilder.user.query()
        .where(user => user.name === undefined)
        .get()

      expect(users).toEqual([{ id: 2, name: undefined }, { id: 4, name: undefined }])
      assertType<Array<{ id: number, name?: string }>>(users)

      /* != operator */
      const users2 = queryBuilder.user.query()
        .where(user => user.name !== undefined)
        .get()

      expect(users2).toEqual([{ id: 1, name: 'John' }, { id: 3, name: 'Doe' }, { id: 5, name: 'Paul' }])
      assertType<Array<{ id: number, name?: string }>>(users2)
    })
  })
})
