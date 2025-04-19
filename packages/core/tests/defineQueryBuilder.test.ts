import { describe, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('defineQueryBuilder', () => {
  it('should validate relations types', () => {
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

    defineQueryBuilder([User], ({ one }) => ({
      user: {
        posts: one(Post, {
          field: User.fields.id,
          reference: Post.fields.userId,
        }),
      },
    }))

    defineQueryBuilder([User], ({ one }) => ({
      user: {
        posts: one(Post, {
          field: User.fields.id,
          reference: Post.fields.userId,
        }),
      },

      // TODO: @ts-expect-error foo is not an entity
      foo: {
        bar: one(User, {
          field: User.fields.id,
          reference: User.fields.id,
        }),
      },
    }))
  })

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
          field: User.fields.id,
          reference: Post.fields.userId,
        }),
      },
      post: {
        user: one(User, {
          field: Post.fields.userId,
          reference: User.fields.id,
        }),
      },
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
      },
    }))
  })
})
