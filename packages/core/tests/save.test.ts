import type { DefaultDatabase } from '../src/database'
import { beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder, getDb } from '../src/orm'

const db = getDb() as DefaultDatabase

describe('save', () => {
  beforeEach(() => {
    db.reset()
  })

  it('should valid types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
      imageId: z.number(),
    }))

    const Settings = defineEntity('settings', z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number(),
      isAdmin: z.boolean(),
    }))

    const Image = defineEntity('image', z.object({
      id: z.number(),
      url: z.string(),
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
        image: one(Image, {
          reference: Image.fields.id,
          field: Post.fields.imageId,
        }),
      },
      settings: {
        user: one(User, {
          reference: User.fields.id,
          field: Settings.fields.userId,
        }),
      },
    }))

    /* user */
    _queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
    }])

    _queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
        imageId: 1,
      }],
    }])

    _queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
        imageId: 1,
        image: {
          id: 1,
          url: 'https://example.com/image.jpg',
        },
      }],
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
      },
    }])

    _queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error invalid object should be a post
      posts: [{}],
      // @ts-expect-error invalid object should be a settings
      settings: [{}],
    }])

    _queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
        imageId: 1,
        // @ts-expect-error invalid object should be an image
        image: {},
      }],
    }])

    // @ts-expect-error missing id
    _queryBuilder.user.save([{
      name: 'John Doe',
    }])

    /* post */
    _queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      imageId: 1,
    }])

    _queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      imageId: 1,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])

    _queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      // @ts-expect-error invalid object should be a user
      user: [{}],
    }])

    // @ts-expect-error missing id
    _queryBuilder.post.save([{
      title: 'Post 1',
      userId: 1,
    }])

    // @ts-expect-error missing userId
    _queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
    }])

    /* settings */
    _queryBuilder.settings.save([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])

    _queryBuilder.settings.save([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])

    _queryBuilder.settings.save([{
      id: 1,
      name: 'Admin',
      // @ts-expect-error invalid object should be a user
      user: [{}],
    }])

    // @ts-expect-error missing id
    _queryBuilder.settings.save([{
      name: 'Admin',
    }])

    const entityWithoutRelations = defineEntity('entityWithoutRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _queryBuilderWithoutRelations = defineQueryBuilder([entityWithoutRelations])

    _queryBuilderWithoutRelations.entityWithoutRelations.save([{
      id: 1,
      name: 'John Doe',
    }])

    expect(() => _queryBuilderWithoutRelations.entityWithoutRelations.save([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have relations
      foo: [],
    }])).toThrow()

    expect(() => _queryBuilderWithoutRelations.entityWithoutRelations.save([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have relations
      bar: {},
    }])).toThrow()
  })

  it('should save entities', () => {
    expect(db.getDb()).toEqual({})

    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    expect(db.getDb()).toEqual({ user: {} })

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
      userId: z.number(),
    }))

    expect(db.getDb()).toEqual({ user: {}, post: {} })

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

    expect(queryBuilder.user.findById(1)).toEqual(null)

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
    }])

    expect(db.getDb()).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
      },
      post: {},
    })

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
    }, {
      id: 2,
      name: 'Jane Doe',
    }])

    expect(db.getDb()).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe' },
      },
      post: {},
    })

    queryBuilder.user.save([{
      id: 2,
      name: 'Jane Doe 2',
    }])

    expect(db.getDb()).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
      },
      post: {},
    })

    queryBuilder.user.save([{
      id: 3,
      name: 'John Doe 2',
      posts: [{
        id: 2,
        title: 'Post 2',
        userId: 3,
      }],
    }])

    expect(db.getDb()).toEqual({
      user: {
        1: { id: 1, name: 'John Doe' },
        2: { id: 2, name: 'Jane Doe 2' },
        3: { id: 3, name: 'John Doe 2' },
      },
      post: {
        2: { id: 2, title: 'Post 2', userId: 3 },
      },
    })

    queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }])

    expect(db.getDb()).toEqual({
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

    queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 3,
        name: 'John Doe 2',
      },
    }])

    expect(db.getDb()).toEqual({
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

    queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 4,
        name: 'John Doe 3',
      },
    }])

    expect(db.getDb()).toEqual({
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

  it('should not save entities with invalid data', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string().min(10),
      userId: z.number(),
    }))

    const queryBuilder = defineQueryBuilder([User, Post], ({ many }) => ({
      user: {
        posts: many(Post, {
          reference: Post.fields.userId,
          field: User.fields.id,
        }),
      },
    }))

    expect(() => queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have test
      test: 'ok',
    }])).toThrow()

    expect(() => queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have post
      post: {
        id: 1,
        title: 'short',
        userId: 1,
      },
    }])).toThrow()

    expect(() => queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error id is missing
      posts: [{
        title: 'short',
        userId: 1,
      }],
    }])).toThrow()
  })

  describe('parsing schema', () => {
    it('should parse schema', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        email: z.string().email(),
      }))

      const queryBuilder = defineQueryBuilder([User])

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'not an email',
      }])).toThrow('Invalid email')

      expect(() => queryBuilder.user.save([{
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

      const queryBuilder = defineQueryBuilder([User, Post], ({ many }) => ({
        user: {
          posts: many(Post, {
            reference: Post.fields.userId,
            field: User.fields.id,
          }),
        },
      }))

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'test@test.com',
        posts: [{
          id: 1,
          title: 'short',
          userId: 1,
        }],
      }])).toThrow('String must contain at least 10 character(s)')

      expect(() => queryBuilder.user.save([{
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

      const queryBuilder = defineQueryBuilder([User, Post], ({ one }) => ({
        post: {
          user: one(User, {
            reference: User.fields.id,
            field: Post.fields.userId,
          }),
        },
      }))

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'short',
        userId: 1,
      }])).toThrow('String must contain at least 10 character(s)')

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
      }])).not.toThrow()

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
        user: {
          id: 1,
          email: 'not an email',
        },
      }])).toThrow('Invalid email')
    })

    it('should parse schema with deep relations - many', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        email: z.string().email(),
      }))

      const Post = defineEntity('post', z.object({
        id: z.number(),
        title: z.string().min(10),
        userId: z.number(),
      }))

      const Comment = defineEntity('comment', z.object({
        id: z.number(),
        content: z.string().max(10),
        postId: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User, Post, Comment], ({ many }) => ({
        user: {
          posts: many(Post, {
            reference: Post.fields.userId,
            field: User.fields.id,
          }),
        },
        post: {
          comments: many(Comment, {
            reference: Comment.fields.postId,
            field: Post.fields.id,
          }),
        },
      }))

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'invalid email',
      }])).toThrow('Invalid email')

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'test@test.com',
      }])).not.toThrow()

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'test@test.com',
        posts: [{
          id: 1,
          title: 'short',
          userId: 1,
        }],
      }])).toThrow('String must contain at least 10 character(s)')

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'test@test.com',
        posts: [{
          id: 1,
          title: 'long enough',
          userId: 1,
        }],
      }])).not.toThrow()

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'test@test.com',
        posts: [{
          id: 1,
          title: 'long enough',
          userId: 1,
          comments: [{
            id: 1,
            content: 'long text content that should be too long',
            postId: 1,
          }, {
            id: 2,
            content: 'content',
            postId: 1,
          }],
        }],
      }])).toThrow('String must contain at most 10 character(s)')

      expect(() => queryBuilder.user.save([{
        id: 1,
        email: 'test@test.com',
        posts: [{
          id: 1,
          title: 'long enough',
          userId: 1,
          comments: [{
            id: 1,
            content: 'short',
            postId: 1,
          }, {
            id: 2,
            content: 'content',
            postId: 1,
          }],
        }],
      }])).not.toThrow()
    })

    it('should parse schema with deep relations - one', () => {
      const User = defineEntity('user', z.object({
        id: z.number(),
        email: z.string().email(),
      }))

      const Post = defineEntity('post', z.object({
        id: z.number(),
        title: z.string().min(10),
        userId: z.number(),
      }))

      const Comment = defineEntity('comment', z.object({
        id: z.number(),
        content: z.string().max(10),
        postId: z.number(),
      }))

      const queryBuilder = defineQueryBuilder([User, Post, Comment], ({ one }) => ({
        post: {
          user: one(User, {
            reference: User.fields.id,
            field: Post.fields.userId,
          }),
        },
        user: {
          comment: one(Comment, {
            reference: Comment.fields.postId,
            field: Post.fields.id,
          }),
        },
      }))

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'short',
        userId: 1,
      }])).toThrow('String must contain at least 10 character(s)')

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
      }])).not.toThrow()

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
        user: {
          id: 1,
          email: 'not an email',
        },
      }])).toThrow('Invalid email')

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
        user: {
          id: 1,
          email: 'test@test.com',
        },
      }])).not.toThrow()

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
        user: {
          id: 1,
          email: 'test@test.com',
          comment: {
            id: 1,
            content: 'long text content that should be too long',
            postId: 1,
          },
        },
      }])).toThrow()

      expect(() => queryBuilder.post.save([{
        id: 1,
        title: 'long enough',
        userId: 1,
        user: {
          id: 1,
          email: 'test@test.com',
          comment: {
            id: 1,
            content: 'short',
            postId: 1,
          },
        },
      }])).not.toThrow()
    })
  })
})
