import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('orWhere', () => {
  it('should valid types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      isAdmin: z.boolean().optional(),
      age: z.number().nullable(),
    }))

    const userQuery = defineQueryBuilder(User)

    const _users = userQuery.query()
      .where(user => user.name === 'John')
      .orWhere(user => user.id > 10)
      .orWhere(user => user.isAdmin === true)
      .orWhere(user => user.age === null)
      .orWhere(user => user.isAdmin !== undefined)
      // @ts-expect-error invalid field
      .orWhere(user => user.foo === true)
      // @ts-expect-error invalid field
      .orWhere(user => user.bar === 'bar')
      // @ts-expect-error invalid value
      .orWhere(user => user.isAdmin === 'true')
      // @ts-expect-error invalid value
      .orWhere(user => user.name === 1)
      // @ts-expect-error invalid value
      .orWhere(user => user.id === true)
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
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])

      /* = and > operators */
      const users = userQuery.query()
        .where(user => user.id === 1)
        .orWhere(user => user.id > 3)
        .get()

      expect(users).toEqual([{ id: 1 }, { id: 4 }])
      assertType<Array<{ id: number }>>(users)

      /* != and < operators */
      const users2 = userQuery.query()
        .where(user => user.id !== 1)
        .orWhere(user => user.id < 2)
        .get()

      expect(users2).toEqual([
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 1 },
      ])
      assertType<Array<{ id: number }>>(users2)
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
        .where(user => user.name === 'John')
        .orWhere(user => user.name === 'Sarah')
        .get()

      expect(users).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Sarah' },
      ])
      assertType<Array<{ id: number, name: string }>>(users)

      /* != operator */
      const users2 = userQuery.query()
        .where(user => user.name !== 'John')
        .orWhere(user => user.name !== 'Sarah')
        .get()

      expect(users2).toEqual([
        { id: 2, name: 'Sarah' },
        { id: 3, name: 'Paul' },
        { id: 4, name: 'Emma' },
        { id: 1, name: 'John' },
      ])
      assertType<Array<{ id: number, name: string }>>(users2)
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
        .where(user => user.isAdmin === true)
        .orWhere(user => user.id === 2)
        .get()

      expect(users).toEqual([
        { id: 1, isAdmin: true },
        { id: 3, isAdmin: true },
        { id: 2, isAdmin: false },
      ])
      assertType<Array<{ id: number, isAdmin: boolean }>>(users)

      /* != operator */
      const users2 = userQuery.query()
        .where(user => user.isAdmin !== true)
        .orWhere(user => user.id === 1)
        .get()

      expect(users2).toEqual([
        { id: 2, isAdmin: false },
        { id: 4, isAdmin: false },
        { id: 1, isAdmin: true },
      ])
      assertType<Array<{ id: number, isAdmin: boolean }>>(users2)
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
        .where(user => user.name === null)
        .orWhere(user => user.id === 1)
        .get()

      expect(users).toEqual([
        { id: 2, name: null },
        { id: 4, name: null },
        { id: 1, name: 'John' },
      ])
      assertType<Array<{ id: number, name: string | null }>>(users)

      /* != operator */
      const users2 = userQuery.query()
        .where(user => user.name !== null)
        .orWhere(user => user.id === 2)
        .get()

      expect(users2).toEqual([
        { id: 1, name: 'John' },
        { id: 3, name: 'Zoe' },
        { id: 5, name: 'Paul' },
        { id: 2, name: null },
      ])
      assertType<Array<{ id: number, name: string | null }>>(users2)
    })

    it('should throw error when orWhere is called before where', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const userQuery = defineQueryBuilder(User)

      expect(() => {
        userQuery.query()
          .orWhere(user => user.name === 'John')
          .get()
      }).toThrow('Cannot use orWhere without where')

      expect(() => {
        userQuery.query()
          .orWhere(user => user.name === 'John')
          .where(user => user.name === 'Sarah')
          .get()
      }).not.toThrow()
    })

    it('multiple where and orWhere combinations', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
        isAdmin: z.boolean(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([
        { id: 1, name: 'John', age: 25, isAdmin: true },
        { id: 2, name: 'Sarah', age: 30, isAdmin: false },
        { id: 3, name: 'Paul', age: 35, isAdmin: true },
        { id: 4, name: 'Emma', age: 40, isAdmin: false },
        { id: 5, name: 'John', age: 45, isAdmin: false },
      ])

      const users1 = userQuery.query()
        .orWhere(user => user.isAdmin === true)
        .where(user => user.name === 'John')
        .where(user => user.age > 30)
        .get()

      expect(users1).toEqual([
        { id: 5, name: 'John', age: 45, isAdmin: false },
        { id: 1, name: 'John', age: 25, isAdmin: true },
        { id: 3, name: 'Paul', age: 35, isAdmin: true },
      ])
      assertType<Array<{ id: number, name: string, age: number, isAdmin: boolean }>>(users1)

      const users2 = userQuery.query()
        .orWhere(user => user.age > 35)
        .where(user => user.name === 'John')
        .where(user => user.isAdmin === false)
        .orWhere(user => user.id === 3)
        .get()

      expect(users2).toEqual([
        { id: 5, name: 'John', age: 45, isAdmin: false },
        { id: 4, name: 'Emma', age: 40, isAdmin: false },
        { id: 3, name: 'Paul', age: 35, isAdmin: true },
      ])
      assertType<Array<{ id: number, name: string, age: number, isAdmin: boolean }>>(users2)

      const users3 = userQuery.query()
        .where(user => user.name === 'John')
        .where(user => user.age > 30)
        .orWhere(user => user.name === 'Sarah')
        .where(user => user.isAdmin === false)
        .orWhere(user => user.id === 1)
        .get()

      expect(users3).toEqual([
        { id: 5, name: 'John', age: 45, isAdmin: false },
        { id: 2, name: 'Sarah', age: 30, isAdmin: false },
        { id: 1, name: 'John', age: 25, isAdmin: true },
      ])
      assertType<Array<{ id: number, name: string, age: number, isAdmin: boolean }>>(users3)
    })
  })
})
