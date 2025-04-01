import { db, defineEntity, defineQueryBuilder } from '@/orm'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('db', () => {
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
})
