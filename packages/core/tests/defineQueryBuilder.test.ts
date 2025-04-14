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

    defineQueryBuilder([User, Post], ({ many, one }) => ({
      user: {
        posts: many(Post, {
          // @ts-expect-error must be a string or number
          field: User.fields.isAdmin,
          // @ts-expect-error must be a string or number
          reference: Post.fields.publishedAt,
        }),
      },
      post: {
        user: one(User, {
          // @ts-expect-error must be a string or number
          field: Post.fields.isPublished,
          // @ts-expect-error must be a string or number and not optional
          reference: User.fields.age,
        }),
      },
    }))

    defineQueryBuilder([User, Post], ({ one }) => ({
      user: {
        posts: one(Post, {
          // @ts-expect-error must be a string or number and not optional
          field: User.fields.age,
          // @ts-expect-error must be a string or number
          reference: Post.fields.isPublished,
        }),
      },
      post: {
        user: one(User, {
          // @ts-expect-error must be a string or number
          field: Post.fields.isPublished,
          // @ts-expect-error must be a string or number
          reference: User.fields.isAdmin,
        }),
      }
    }))
  })
})
