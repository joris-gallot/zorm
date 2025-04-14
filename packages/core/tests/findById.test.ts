import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

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

    const _queryBuilder = defineQueryBuilder([User, Post, Settings], ({ many, one }) => ({
      user: {
        posts: many(Post, {
          reference: Post.fields.userId,
          field: User.fields.id,
        }),
        settings: one(Settings, {
          reference: Settings.fields.userId,
          field: User.fields.id,
        }),
      },
      post: {
        user: one(User, {
          reference: User.fields.id,
          field: Post.fields.userId,
        }),
      },
    }))

    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>({})
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>(undefined)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>(true)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.user.findById>[0]>([])

    assertType<Parameters<typeof _queryBuilder.user.findById>[1]>({ with: { posts: true } })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _queryBuilder.user.findById>[1]>({ with: { invalid: true } })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _queryBuilder.user.findById>[1]>({ with: { posts: true, invalid: true } })

    assertType<Parameters<typeof _queryBuilder.post.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.post.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.post.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.post.findById>[0]>(undefined)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilder.post.findById>[0]>(true)

    assertType<Parameters<typeof _queryBuilder.post.findById>[1]>({ with: { user: true } })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _queryBuilder.post.findById>[1]>({ with: { user: true, invalid: true } })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _queryBuilder.post.findById>[1]>({ with: { invalid: true } })

    const entityWithoutRelations = defineEntity('entityWithoutRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _queryBuilderWithoutRelations = defineQueryBuilder([entityWithoutRelations])

    assertType<Parameters<typeof _queryBuilderWithoutRelations.entityWithoutRelations.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilderWithoutRelations.entityWithoutRelations.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilderWithoutRelations.entityWithoutRelations.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _queryBuilderWithoutRelations.entityWithoutRelations.findById>[0]>(undefined)

    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _queryBuilderWithoutRelations.entityWithoutRelations.findById>[1]>({ with: { foo: true } })
    // @ts-expect-error invalid with option
    assertType<Parameters<typeof _queryBuilderWithoutRelations.entityWithoutRelations.findById>[1]>({ with: {} })
  })

  it('shoud work with string id', () => {
    const User = defineEntity('user', z.object({
      id: z.string(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.string(),
    }))

    const queryBuilder = defineQueryBuilder([User, Post], ({ many }) => ({
      user: {
        posts: many(Post, {
          reference: Post.fields.userId,
          field: User.fields.id,
        }),
      },
    }))

    queryBuilder.user.save([{
      id: '1',
      name: 'John Doe',
    }])

    queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: '1',
    }])

    const user = queryBuilder.user.findById('1')

    expect(user).toEqual({
      id: '1',
      name: 'John Doe',
    })
    assertType<{
      id: string
      name: string
    } | null>(user)

    const userWithPosts = queryBuilder.user.findById('1', { with: { posts: true } })

    expect(userWithPosts).toEqual({
      id: '1',
      name: 'John Doe',
      posts: [{ id: 1, title: 'Post 1', userId: '1' }],
    })
    assertType<{
      id: string
      name: string
      posts: Array<{
        id: number
        title: string
        userId: string
      }>
    } | null>(userWithPosts)
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

    const queryBuilder = defineQueryBuilder([User, Post], ({ many, one }) => ({
      user: {
        posts: many(Post, {
          reference: Post.fields.userId,
          field: User.fields.id,
        }),
      },
      post: {
        user: one(User, {
          reference: User.fields.id,
          field: Post.fields.userId,
        }),
      },
    }))

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
    }])

    queryBuilder.post.save([{
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

    const user = queryBuilder.user.findById(1)

    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
    })
    assertType<{
      id: number
      name: string
    } | null>(user)

    const userWithPosts = queryBuilder.user.findById(1, { with: { posts: true } })

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

    const post = queryBuilder.post.findById(1)

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

    const postWithUser = queryBuilder.post.findById(1, { with: { user: true } })

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

  it('should throw if relation does not exist', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const queryBuilder = defineQueryBuilder([User])

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
    }])

    expect(() =>
      // @ts-expect-error relation does not exist
      queryBuilder.user.findById(1, { with: { posts: true } }),
    ).toThrow('Relation posts not found on entity user')

    expect(() =>
      // @ts-expect-error relation does not exist
      queryBuilder.user.findById(1, { with: { invalid: true, posts: { user: true } } }),
    ).toThrow('Relation invalid not found on entity user')
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

    const queryBuilder = defineQueryBuilder([User, Post, Settings], ({ many, one }) => ({
      user: {
        posts: many(Post, {
          reference: Post.fields.userId,
          field: User.fields.id,
        }),
        settings: one(Settings, {
          reference: Settings.fields.userId,
          field: User.fields.id,
        }),
      },
      post: {
        user: one(User, {
          reference: User.fields.id,
          field: Post.fields.userId,
        }),
      },
      settings: {
        user: one(User, {
          reference: User.fields.id,
          field: Settings.fields.userId,
        }),
      },
    }))

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
    }])

    queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }, {
      id: 2,
      title: 'Post 2',
      userId: 2,
    }])

    queryBuilder.settings.save([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])

    const userWithPostsAndSettings = queryBuilder.user.findById(1, { with: { posts: true, settings: true } })

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

    const userWithPosts = queryBuilder.user.findById(1, { with: { posts: true } })

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

    const userWithSettings = queryBuilder.user.findById(1, { with: { settings: true } })

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
