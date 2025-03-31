import { defineEntity, defineQueryBuilder } from '@/orm'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('parsing schema', () => {
  it('should parse schema when saving', () => {
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
