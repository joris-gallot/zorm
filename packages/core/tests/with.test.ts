import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('with', () => {
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
    }, {
      id: 2,
      name: 'Jane Doe',
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

    const users = userQuery.query()
      .where(user => user.name === 'John Doe')
      .with('posts')
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

    const posts = postQuery.query()
      .where(post => post.title === 'Post 1')
      .with('user')
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

    const userQuery = defineQueryBuilder(User)

    userQuery.save([{
      id: 1,
      name: 'John Doe',
    }])

    expect(() =>
      // @ts-expect-error relation does not exist
      userQuery.query().with('posts'),
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

    userQuery.save([{
      id: 1,
      name: 'John Doe',
    }])

    const postQuery = defineQueryBuilder(Post)
    postQuery.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }])

    const settingsQuery = defineQueryBuilder(Settings)
    settingsQuery.save([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])

    const users = userQuery.query()
      .where(user => user.name === 'John Doe')
      .with('posts')
      .with('settings')
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
  })
})
