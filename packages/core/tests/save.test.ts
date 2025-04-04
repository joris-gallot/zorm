import { assertType, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { db, defineEntity, defineQueryBuilder } from '../src/orm'

describe('save', () => {
  beforeEach(() => {
    // Reset db before each test
    Object.keys(db).forEach((key) => {
      delete db[key]
    })
  })

  it('should valid types', () => {
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

  it('should save entities', () => {
    expect(db).toEqual({})

    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    expect(db).toEqual({ user: {} })

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
    }))

    expect(db).toEqual({ user: {}, post: {} })

    const userQuery = defineQueryBuilder(User, ({ many }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
    }))

    expect(userQuery.findById(1)).toEqual(null)

    userQuery.save([{
      id: 1,
      name: 'John Doe',
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
      },
      post: {},
    })

    userQuery.save([{
      id: 1,
      name: 'John Doe',
    }, {
      id: 2,
      name: 'Jane Doe',
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe' },
      },
      post: {},
    })

    userQuery.save([{
      id: 2,
      name: 'Jane Doe 2',
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
      },
      post: {},
    })

    userQuery.save([{
      id: 3,
      name: 'John Doe 2',
      posts: [{
        id: 2,
        title: 'Post 2',
        userId: 3,
      }],
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
        3: { id: 3, name: 'John Doe 2' },
      },
      post: {
        2: { id: 2, title: 'Post 2', userId: 3 },
      },
    })

    const postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    postQuery.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
        3: { id: 3, name: 'John Doe 2' },
      },
      post: {
        1: { id: 1, title: 'Post 1', userId: 1 },
        2: { id: 2, title: 'Post 2', userId: 3 },
      },
    })

    postQuery.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 3,
        name: 'John Doe 2',
      },
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
        3: { id: 3, name: 'John Doe 2' },
      },
      post: {
        1: { id: 1, title: 'Post 1', userId: 1 },
        2: { id: 2, title: 'Post 2', userId: 3 },
      },
    })

    postQuery.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 4,
        name: 'John Doe 3',
      },
    }])

    expect(db).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
        3: { id: 3, name: 'John Doe 2' },
        4: { id: 4, name: 'John Doe 3' },
      },
      post: {
        1: { id: 1, title: 'Post 1', userId: 1 },
        2: { id: 2, title: 'Post 2', userId: 3 },
      },
    })
  })

  describe('parsing schema', () => {
    it('should parse schema', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        email: z.string().email(),
      }))

      const userQuery = defineQueryBuilder(User)

      expect(() => userQuery.save([{
        id: 1,
        email: 'not an email',
      }])).toThrow('Invalid email')

      expect(() => userQuery.save([{
        id: 1,
        email: 'test@test.com',
      }])).not.toThrow()
    })

    it('should parse schema in relations - many', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        email: z.string().email(),
      }))

      const Post = defineEntity('post', z.object({
        id: z.number(),
        title: z.string().min(10),
        userId: z.number(),
      }))

      const userQuery = defineQueryBuilder(User, ({ many }) => ({
        posts: many(Post, {
          reference: Post.fields.userId,
          field: User.fields.id,
        }),
      }))

      expect(() => userQuery.save([{
        id: 1,
        email: 'test@test.com',
        posts: [{
          id: 1,
          title: 'short',
          userId: 1,
        }],
      }])).toThrow('String must contain at least 10 character(s)')

      expect(() => userQuery.save([{
        id: 1,
        email: 'not an email',
        posts: [{
          id: 1,
          title: 'short',
          userId: 1,
        }],
      }])).toThrow('Invalid email')
    })

    it('should parse schema in relations - one', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        email: z.string().email(),
      }))

      const Post = defineEntity('post', z.object({
        id: z.number(),
        title: z.string().min(10),
        userId: z.number(),
      }))

      const postQuery = defineQueryBuilder(Post, ({ one }) => ({
        user: one(User, {
          reference: User.fields.id,
          field: Post.fields.userId,
        }),
      }))

      expect(() => postQuery.save([{
        id: 1,
        title: 'short',
        userId: 1,
      }])).toThrow('String must contain at least 10 character(s)')

      expect(() => postQuery.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
      }])).not.toThrow()

      expect(() => postQuery.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
        user: {
          id: 1,
          email: 'not an email',
        },
      }])).toThrow('Invalid email')
    })
  })
})
