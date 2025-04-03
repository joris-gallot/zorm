import { defineEntity, defineQueryBuilder } from '@/orm'
import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('query', () => {
  it('findById', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
    }))

    const Settings = defineEntity('settings', z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number(),
      isAdmin: z.boolean(),
    }))

    const _userQuery = defineQueryBuilder(User, ({ many, one }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
      settings: one(Settings, {
        reference: Settings.fields.userId,
        field: User.fields.id,
      }),
    }))

    const _postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    assertType<Parameters<typeof _userQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>({})
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>(undefined)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>(true)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>([])

    assertType<Parameters<typeof _userQuery.findById>[1]>({ with: ['posts'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _userQuery.findById>[1]>({ with: ['invalid'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _userQuery.findById>[1]>({ with: ['posts', 'invalid'] })

    assertType<Parameters<typeof _postQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>(undefined)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>(true)

    assertType<Parameters<typeof _postQuery.findById>[1]>({ with: ['user'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _postQuery.findById>[1]>({ with: ['user', 'invalid'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _postQuery.findById>[1]>({ with: ['invalid'] })

    const entityWithRelations = defineEntity('entityWithRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _entityWithRelationsQuery = defineQueryBuilder(entityWithRelations)

    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>(undefined)

    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[1]>({ with: ['foo'] })
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[1]>({ with: [] })
  })

  it('save', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
    }))

    const Settings = defineEntity('settings', z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number(),
      isAdmin: z.boolean(),
    }))

    const _userQuery = defineQueryBuilder(User, ({ many, one }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
      settings: one(Settings, {
        reference: Settings.fields.userId,
        field: User.fields.id,
      }),
    }))

    const _postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    const _settingsQuery = defineQueryBuilder(Settings, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Settings.fields.userId,
      }),
    }))

    /* user */
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
    }])
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
      }],
    }])
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
      }],
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
      },
    }])
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error invalid object should be a post
      posts: [{}],
      // @ts-expect-error invalid object should be a settings
      settings: [{}],
    }])
    // @ts-expect-error missing id
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      name: 'John Doe',
    }])

    /* post */
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }])
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      // @ts-expect-error invalid object should be a user
      user: [{}],
    }])
    // @ts-expect-error missing id
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      title: 'Post 1',
      userId: 1,
    }])
    // @ts-expect-error missing userId
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
    }])

    /* settings */
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      id: 1,
      name: 'Admin',
      // @ts-expect-error invalid object should be a user
      user: [{}],
    }])
    // @ts-expect-error missing id
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      name: 'Admin',
    }])

    const entityWithoutRelations = defineEntity('entityWithoutRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _entityWithoutRelationsQuery = defineQueryBuilder(entityWithoutRelations)

    assertType<Parameters<typeof _entityWithoutRelationsQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
    }])

    assertType<Parameters<typeof _entityWithoutRelationsQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have relations
      foo: [],
    }])

    assertType<Parameters<typeof _entityWithoutRelationsQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have relations
      bar: {},
    }])
  })

  describe('where', () => {
    it('should valid types', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        isAdmin: z.boolean().optional(),
      }))

      const userQuery = defineQueryBuilder(User)

      const _users = userQuery.query()
        .where('name', '=', 'John')
        .where('id', '>', 10)
        .where('isAdmin', '=', true)
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
      }])
    })

    it('should filter by field', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        name: z.string(),
        isAdmin: z.boolean().optional(),
      }))

      const userQuery = defineQueryBuilder(User)

      userQuery.save([{
        id: 1,
        name: 'John Doe',
        isAdmin: true,
      }, {
        id: 2,
        name: 'Simon Eder',
        isAdmin: false,
      }, {
        id: 3,
        name: 'Max Mustermann',
        isAdmin: false,
      }])

      const users = userQuery.query()
        .where('name', '=', 'John Doe')
        .get()

      const expectedUsers = [{
        id: 1,
        name: 'John Doe',
        isAdmin: true,
      }]
      assertType<typeof users>(expectedUsers)
      expect(users).toEqual(expectedUsers)

      const users2 = userQuery.query()
        .where('id', '>', 1)
        .get()

      const expectedUsers2 = [{
        id: 2,
        name: 'Simon Eder',
        isAdmin: false,
      }, {
        id: 3,
        name: 'Max Mustermann',
        isAdmin: false,
      }]
      assertType<typeof users2>(expectedUsers2)
      expect(users2).toEqual(expectedUsers2)

      const users3 = userQuery.query()
        .where('id', '>', 1)
        .where('id', '<', 3)
        .get()

      const expectedUsers3 = [{
        id: 2,
        name: 'Simon Eder',
        isAdmin: false,
      }]
      assertType<typeof users3>(expectedUsers3)
      expect(users3).toEqual(expectedUsers3)

      const users4 = userQuery.query()
        .where('isAdmin', '=', false)
        .where('id', '<', 3)
        .where('name', '=', 'Simon Eder')
        .get()

      const expectedUsers4 = [{
        id: 2,
        name: 'Simon Eder',
        isAdmin: false,
      }]
      assertType<typeof users4>(expectedUsers4)
      expect(users4).toEqual(expectedUsers4)

      const users5 = userQuery.query()
        .where('isAdmin', '=', false)
        .where('id', '<=', 3)
        .get()

      const expectedUsers5 = [{
        id: 2,
        name: 'Simon Eder',
        isAdmin: false,
      }, {
        id: 3,
        name: 'Max Mustermann',
        isAdmin: false,
      }]
      assertType<typeof users5>(expectedUsers5)
      expect(users5).toEqual(expectedUsers5)
    })
  })
})
