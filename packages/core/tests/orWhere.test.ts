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
      .where('name', '=', 'John')
      .orWhere('id', '>', 10)
      .orWhere('isAdmin', '=', true)
      .orWhere('age', '=', null)
      // @ts-expect-error invalid value
      .orWhere('age', '!=', undefined)
      .orWhere('isAdmin', '!=', undefined)
      // @ts-expect-error invalid operator
      .orWhere('isAdmin', 'is', true)
      // @ts-expect-error invalid operator
      .orWhere('isAdmin', '', true)
      // @ts-expect-error invalid field
      .orWhere('foo', '=', 'bar')
      // @ts-expect-error invalid field
      .orWhere('', '=', 'bar')
      // @ts-expect-error invalid value
      .orWhere('isAdmin', '!=', null)
      // @ts-expect-error invalid value
      .orWhere('isAdmin', '=', 'true')
      // @ts-expect-error invalid value
      .orWhere('name', '=', 1)
      // @ts-expect-error invalid value
      .orWhere('id', '=', true)
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
        .where('id', '=', 1)
        .orWhere('id', '>', 3)
        .get()

      expect(users).toEqual([{ id: 1 }, { id: 4 }])

      /* != and < operators */
      const users2 = userQuery.query()
        .where('id', '!=', 1)
        .orWhere('id', '<', 2)
        .get()

      expect(users2).toEqual([
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 1 },
      ])
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
        .orWhere('name', '=', 'Sarah')
        .get()

      expect(users).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Sarah' },
      ])

      /* != operator */
      const users2 = userQuery.query()
        .where('name', '!=', 'John')
        .orWhere('name', '!=', 'Sarah')
        .get()

      expect(users2).toEqual([
        { id: 2, name: 'Sarah' },
        { id: 3, name: 'Paul' },
        { id: 4, name: 'Emma' },
        { id: 1, name: 'John' },
      ])
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
        .orWhere('id', '=', 2)
        .get()

      expect(users).toEqual([
        { id: 1, isAdmin: true },
        { id: 3, isAdmin: true },
        { id: 2, isAdmin: false },
      ])

      /* != operator */
      const users2 = userQuery.query()
        .where('isAdmin', '!=', true)
        .orWhere('id', '=', 1)
        .get()

      expect(users2).toEqual([
        { id: 2, isAdmin: false },
        { id: 4, isAdmin: false },
        { id: 1, isAdmin: true },
      ])
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
        .orWhere('id', '=', 1)
        .get()

      expect(users).toEqual([
        { id: 2, name: null },
        { id: 4, name: null },
        { id: 1, name: 'John' },
      ])

      /* != operator */
      const users2 = userQuery.query()
        .where('name', '!=', null)
        .orWhere('id', '=', 2)
        .get()

      expect(users2).toEqual([
        { id: 1, name: 'John' },
        { id: 3, name: 'Zoe' },
        { id: 5, name: 'Paul' },
        { id: 2, name: null },
      ])
    })

    it('should throw error when orWhere is called before where', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const userQuery = defineQueryBuilder(User)

      expect(() => {
        userQuery.query()
          .orWhere('name', '=', 'John')
          .get()
      }).toThrow('orWhere must be called after where')
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

      // Test 1: Multiple where followed by orWhere
      const users1 = userQuery.query()
        .where('name', '=', 'John')
        .where('age', '>', 30)
        .orWhere('isAdmin', '=', true)
        .get()

      expect(users1).toEqual([
        { id: 5, name: 'John', age: 45, isAdmin: false },
        { id: 1, name: 'John', age: 25, isAdmin: true },
        { id: 3, name: 'Paul', age: 35, isAdmin: true },
      ])

      // Test 2: Multiple where and orWhere combinations
      const users2 = userQuery.query()
        .where('name', '=', 'John')
        .orWhere('age', '>', 35)
        .where('isAdmin', '=', false)
        .orWhere('id', '=', 3)
        .get()

      expect(users2).toEqual([
        { id: 5, name: 'John', age: 45, isAdmin: false },
        { id: 4, name: 'Emma', age: 40, isAdmin: false },
        { id: 3, name: 'Paul', age: 35, isAdmin: true },
      ])

      // Test 3: Complex combination with multiple conditions
      const users3 = userQuery.query()
        .where('name', '=', 'John')
        .where('age', '>', 30)
        .orWhere('name', '=', 'Sarah')
        .where('isAdmin', '=', false)
        .orWhere('id', '=', 1)
        .get()

      expect(users3).toEqual([
        { id: 5, name: 'John', age: 45, isAdmin: false },
        { id: 2, name: 'Sarah', age: 30, isAdmin: false },
        { id: 1, name: 'John', age: 25, isAdmin: true },
      ])
    })
  })
})
