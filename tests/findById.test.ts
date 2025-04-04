import { defineEntity, defineQueryBuilder } from '@/orm'
import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('findById', () => {
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

    const entityWithoutRelations = defineEntity('entityWithoutRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _entityWithoutRelationsQuery = defineQueryBuilder(entityWithoutRelations)

    assertType<Parameters<typeof _entityWithoutRelationsQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithoutRelationsQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithoutRelationsQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithoutRelationsQuery.findById>[0]>(undefined)

    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _entityWithoutRelationsQuery.findById>[1]>({ with: ['foo'] })
    assertType<Parameters<typeof _entityWithoutRelationsQuery.findById>[1]>({ with: [] })
  })

  it('should find by id with relations', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
    }))

    const userQuery = defineQueryBuilder(User, ({ many }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
    }))

    const postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    userQuery.save([{
      id: 1,
      name: 'John Doe',
    }])

    postQuery.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }, {
      id: 2,
      title: 'Post 2',
      userId: 2,
    }, {
      id: 3,
      title: 'Post 3',
      userId: 1,
    }])

    const user = userQuery.findById(1)

    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
    })
    assertType<{
      id: number
      name: string
    } | null>(user)

    const userWithPosts = userQuery.findById(1, { with: ['posts'] })

    expect(userWithPosts).toEqual({
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
      }, {
        id: 3,
        title: 'Post 3',
        userId: 1,
      }],
    })
    assertType<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
      }>
    } | null>(userWithPosts)

    const post = postQuery.findById(1)

    expect(post).toEqual({
      id: 1,
      title: 'Post 1',
      userId: 1,
    })
    assertType<{
      id: number
      title: string
      userId: number
    } | null>(post)

    const postWithUser = postQuery.findById(1, { with: ['user'] })

    expect(postWithUser).toEqual({
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 1,
        name: 'John Doe',
      },
    })
    assertType<{
      id: number
      title: string
      userId: number
      user: {
        id: number
        name: string
      }
    } | null>(postWithUser)
  })

  it('should find by id with multiple relations', () => {
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

    const userQuery = defineQueryBuilder(User, ({ many, one }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
      settings: one(Settings, {
        reference: Settings.fields.userId,
        field: User.fields.id,
      }),
    }))

    const postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    const settingsQuery = defineQueryBuilder(Settings, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Settings.fields.userId,
      }),
    }))

    userQuery.save([{
      id: 1,
      name: 'John Doe',
    }])

    postQuery.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }, {
      id: 2,
      title: 'Post 2',
      userId: 2,
    }])

    settingsQuery.save([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])

    const userWithPostsAndSettings = userQuery.findById(1, { with: ['posts', 'settings'] })

    expect(userWithPostsAndSettings).toEqual({
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
    })

    assertType<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
      }>
      settings: {
        id: number
        name: string
        userId: number
        isAdmin: boolean
      }
    } | null>(userWithPostsAndSettings)

    const userWithPosts = userQuery.findById(1, { with: ['posts'] })

    expect(userWithPosts).toEqual({
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
      }],
    })

    assertType<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
      }>
    } | null>(userWithPosts)

    const userWithSettings = userQuery.findById(1, { with: ['settings'] })

    expect(userWithSettings).toEqual({
      id: 1,
      name: 'John Doe',
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
      },
    })

    assertType<{
      id: number
      name: string
      settings: {
        id: number
        name: string
        userId: number
        isAdmin: boolean
      }
    } | null>(userWithSettings)
  })
})
