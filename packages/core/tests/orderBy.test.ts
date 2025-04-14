import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('orderBy', () => {
  it('should validate types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      age: z.number(),
      isAdmin: z.boolean(),
    }))

    const queryBuilder = defineQueryBuilder([User])

    const _users = queryBuilder.user.query()
      .orderBy([obj => obj.name, obj => obj.age], ['asc', 'desc'])
      // @ts-expect-error invalid field
      .orderBy([obj => obj.foo], ['asc'])
      // @ts-expect-error invalid direction
      .orderBy([obj => obj.name], ['invalid'])
      // @ts-expect-error invalid field
      .orderBy([obj => obj.name, obj => obj.foo], ['bar', 'asc'])
      .get()

    assertType<typeof _users>([{
      id: 1,
      name: 'John',
      age: 30,
      isAdmin: true,
    }])
  })

  describe('sort with multiple fields', () => {
    it('should sort by name ascending and age descending', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'John', age: 25 },
        { id: 3, name: 'Alice', age: 20 },
        { id: 4, name: 'Bob', age: 35 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name, obj => obj.age], ['asc', 'desc'])
        .get()

      expect(users).toEqual([
        { id: 3, name: 'Alice', age: 20 },
        { id: 4, name: 'Bob', age: 35 },
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'John', age: 25 },
      ])

      assertType<Array<{
        id: number
        name: string
        age: number
      }>>(users)
    })

    it('should sort by age ascending and name descending', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'John', age: 25 },
        { id: 3, name: 'Alice', age: 20 },
        { id: 4, name: 'Bob', age: 35 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age, obj => obj.name], ['asc', 'desc'])
        .get()

      expect(users).toEqual([
        { id: 3, name: 'Alice', age: 20 },
        { id: 2, name: 'John', age: 25 },
        { id: 1, name: 'John', age: 30 },
        { id: 4, name: 'Bob', age: 35 },
      ])

      assertType<Array<{
        id: number
        name: string
        age: number
      }>>(users)
    })
  })

  describe('sort with single field', () => {
    it('should sort by name ascending', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
        { id: 1, name: 'John' },
      ])

      assertType<Array<{
        id: number
        name: string
      }>>(users)
    })

    it('should sort by name descending', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name], ['desc'])
        .get()

      expect(users).toEqual([
        { id: 1, name: 'John' },
        { id: 3, name: 'Bob' },
        { id: 2, name: 'Alice' },
      ])

      assertType<Array<{
        id: number
        name: string
      }>>(users)
    })

    it('should sort by age ascending', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: 30 },
        { id: 2, age: 25 },
        { id: 3, age: 35 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 2, age: 25 },
        { id: 1, age: 30 },
        { id: 3, age: 35 },
      ])

      assertType<Array<{
        id: number
        age: number
      }>>(users)
    })

    it('should sort by age descending', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: 30 },
        { id: 2, age: 25 },
        { id: 3, age: 35 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['desc'])
        .get()

      expect(users).toEqual([
        { id: 3, age: 35 },
        { id: 1, age: 30 },
        { id: 2, age: 25 },
      ])

      assertType<Array<{
        id: number
        age: number
      }>>(users)
    })
  })

  describe('sort with relations', () => {
    it('should not impact the order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
      }))

      const Post = defineEntity('post', z.object({
        id: z.number(),
        title: z.string(),
        userId: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User, Post], ({ many }) => ({
        user: {
          posts: many(Post, {
            reference: Post.fields.userId,
            field: User.fields.id,
          }),
        },
      }))

      queryBuilder.user.save([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Alice', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
      ])

      queryBuilder.post.save([
        { id: 1, title: 'Post 1', userId: 1 },
        { id: 2, title: 'Post 2', userId: 1 },
        { id: 3, title: 'Post 3', userId: 2 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['asc'])
        .with('posts')
        .get()

      expect(users).toEqual([
        {
          id: 2,
          name: 'Alice',
          age: 25,
          posts: [
            { id: 3, title: 'Post 3', userId: 2 },
          ],
        },
        {
          id: 1,
          name: 'John',
          age: 30,
          posts: [
            { id: 1, title: 'Post 1', userId: 1 },
            { id: 2, title: 'Post 2', userId: 1 },
          ],
        },
        {
          id: 3,
          name: 'Bob',
          age: 35,
          posts: [],
        },
      ])

      assertType<Array<{
        id: number
        name: string
        age: number
        posts: Array<{
          id: number
          title: string
          userId: number
        }>
      }>>(users)
    })
  })

  describe('sort with null and undefined values', () => {
    it('should handle both values being undefined in ascending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: undefined },
        { id: 2, age: undefined },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 1, age: undefined },
        { id: 2, age: undefined },
      ])
    })

    it('should handle both values being undefined in descending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: undefined },
        { id: 2, age: undefined },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['desc'])
        .get()

      expect(users).toEqual([
        { id: 1, age: undefined },
        { id: 2, age: undefined },
      ])
    })

    it('should handle first value being undefined in ascending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: undefined },
        { id: 2, age: 30 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 2, age: 30 },
        { id: 1, age: undefined },
      ])
    })

    it('should handle first value being undefined in descending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: undefined },
        { id: 2, age: 30 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['desc'])
        .get()

      expect(users).toEqual([
        { id: 1, age: undefined },
        { id: 2, age: 30 },
      ])
    })

    it('should handle second value being undefined in ascending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: 30 },
        { id: 2, age: undefined },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 1, age: 30 },
        { id: 2, age: undefined },
      ])
    })

    it('should handle second value being undefined in descending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number().optional(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: 30 },
        { id: 2, age: undefined },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['desc'])
        .get()

      expect(users).toEqual([
        { id: 2, age: undefined },
        { id: 1, age: 30 },
      ])
    })

    it('should handle equal values in ascending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: 30 },
        { id: 2, age: 30 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 1, age: 30 },
        { id: 2, age: 30 },
      ])
    })

    it('should handle equal values in descending order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, age: 30 },
        { id: 2, age: 30 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.age], ['desc'])
        .get()

      expect(users).toEqual([
        { id: 1, age: 30 },
        { id: 2, age: 30 },
      ])
    })
  })

  describe('sort with multiple criteria and orders', () => {
    it('should handle more criteria than orders', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'John', age: 25 },
        { id: 3, name: 'Alice', age: 20 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name, obj => obj.age], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 3, name: 'Alice', age: 20 },
        { id: 2, name: 'John', age: 25 },
        { id: 1, name: 'John', age: 30 },
      ])
    })

    it('should handle more orders than criteria', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name], ['asc', 'desc'])
        .get()

      expect(users).toEqual([
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
        { id: 1, name: 'John' },
      ])
    })

    it('should handle undefined order', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name], [undefined as any])
        .get()

      expect(users).toEqual([
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
        { id: 1, name: 'John' },
      ])
    })

    it('should handle transformation function as criterion', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Alice', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
      ])

      const users = queryBuilder.user.query()
        .orderBy([obj => obj.name.length], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 3, name: 'Bob', age: 35 },
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Alice', age: 25 },
      ])
    })

    it('should handle direct key access as criterion', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      queryBuilder.user.save([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Alice', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
      ])

      const users = queryBuilder.user.query()
        .orderBy(['name'], ['asc'])
        .get()

      expect(users).toEqual([
        { id: 2, name: 'Alice', age: 25 },
        { id: 3, name: 'Bob', age: 35 },
        { id: 1, name: 'John', age: 30 },
      ])
    })
  })
})
