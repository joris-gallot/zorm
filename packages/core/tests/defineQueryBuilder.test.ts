import { describe, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('defineQueryBuilder', () => {
  it('should validate relations reference types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      isAdmin: z.boolean(),
      age: z.number().optional(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
      publishedAt: z.date(),
      isPublished: z.boolean(),
    }))

    const _userQuery = defineQueryBuilder(User, ({ many }) => ({
      posts: many(Post, {
        // @ts-expect-error must be a string or number
        field: User.fields.isAdmin,
        // @ts-expect-error must be a string or number
        reference: Post.fields.publishedAt,
      }),
    }))

    const _userQuery2 = defineQueryBuilder(User, ({ one }) => ({
      posts: one(Post, {
        // @ts-expect-error must be a string or number and not optional
        field: User.fields.age,
        // @ts-expect-error must be a string or number
        reference: Post.fields.isPublished,
      }),
    }))

    const _postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        // @ts-expect-error must be a string or number
        field: Post.fields.isPublished,
        // @ts-expect-error must be a string or number and not optional
        reference: User.fields.age,
      }),
    }))

    const _postQuery2 = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        // @ts-expect-error must be a string or number
        field: Post.fields.isPublished,
        // @ts-expect-error must be a string or number
        reference: User.fields.isAdmin,
      }),
    }))
  })
})
