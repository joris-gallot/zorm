import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('with', () => {
  it('should valid types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const queryBuilder = defineQueryBuilder([User])

    const _usersWithPosts = queryBuilder.user.query()
      // @ts-expect-error not relations defined
      .with({ posts: true })
      .get()

    assertType<Array<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
      }>
    }>>(_usersWithPosts)

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
    }))

    const Comment = defineEntity('comment', z.object({
      id: z.number(),
      content: z.string(),
      postId: z.number(),
    }))

    const queryBuilder2 = defineQueryBuilder([User, Post, Comment], ({ many, one }) => ({
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
        comments: many(Comment, {
          reference: Comment.fields.postId,
          field: Post.fields.id,
        }),
      },
    }))

    const _users = queryBuilder2.user.query()
      .with({ posts: { user: true } })
      // @ts-expect-error should be a boolean
      .with({ posts: 'true' })
      // @ts-expect-error should be a boolean
      .with({ posts: { user: 1 } })
      // @ts-expect-error invalid relation name
      .with({ posts: true, invalid: true })
      // @ts-expect-error invalid relation name
      .with({ posts: { comments: true, invalid: true } })
      // @ts-expect-error should be a boolean
      .with({ posts: { comments: {} } })
      .with({ posts: true })
      .with({ posts: { comments: true } })
      .get()
  })

  it('should load relations', () => {
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
    }, {
      id: 2,
      name: 'Jane Doe',
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

    const users = queryBuilder.user.query()
      .with({ posts: true })
      .where(user => user.name === 'John Doe')
      .get()

    expect(users).toEqual([{
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
    }])

    assertType<Array<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
      }>
    }>>(users)

    const posts = queryBuilder.post.query()
      .where(post => post.title === 'Post 1')
      .with({ user: true })
      .get()

    expect(posts).toEqual([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])

    assertType<Array<{
      id: number
      title: string
      userId: number
      user: {
        id: number
        name: string
      }
    }>>(posts)
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
      queryBuilder.user.query().with({ posts: true }),
    ).toThrow('Relation posts not found on entity user')
  })

  it('should work with multiple relations', () => {
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
    }])

    queryBuilder.settings.save([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])

    const users = queryBuilder.user.query()
      .where(user => user.name === 'John Doe')
      .with({ posts: true, settings: true })
      .get()

    expect(users).toEqual([{
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

    assertType<Array<{
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
    }>>(users)

    const users2 = queryBuilder.user.query()
      .where(user => user.name === 'John Doe')
      .with({ posts: true })
      .with({ settings: true })
      .get()

    expect(users2).toEqual([{
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

    assertType<Array<{
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
    }>>(users2)

    const users3 = queryBuilder.user.query()
      .where(user => user.name === 'John Doe')
      .with({ settings: true })
      .get()

    expect(users3).toEqual([{
      id: 1,
      name: 'John Doe',
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
      },
    }])

    assertType<Array<{
      id: number
      name: string
      settings: {
        id: number
        name: string
        userId: number
        isAdmin: boolean
      }
    }>>(users3)
  })
})
