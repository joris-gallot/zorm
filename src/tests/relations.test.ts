import { defineEntity, defineQueryBuilder } from '@/orm'
import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('relations', () => {
  it('one to many', () => {
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
})
