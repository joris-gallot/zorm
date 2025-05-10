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

    const Comment = defineEntity('comment', z.object({
      id: z.number(),
      content: z.string(),
      postId: z.number(),
    }))

    const _queryBuilder = defineQueryBuilder([User, Post, Settings, Comment], ({ many, one }) => ({
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
        comments: many(Comment, {
          reference: Comment.fields.postId,
          field: Post.fields.id,
        }),
      },
    }))

    _queryBuilder.user.findById(1)
    // @ts-expect-error invalid type should be number
    _queryBuilder.user.findById('1')
    // @ts-expect-error invalid type should be number
    _queryBuilder.user.findById({})
    // @ts-expect-error invalid type should be number
    _queryBuilder.user.findById(null)
    // @ts-expect-error invalid type should be number
    _queryBuilder.user.findById(undefined)
    // @ts-expect-error invalid type should be number
    _queryBuilder.user.findById(true)
    // @ts-expect-error invalid type should be number
    _queryBuilder.user.findById([])

    _queryBuilder.user.findById(1, { with: { posts: true } })
    // @ts-expect-error invalid relation name
    _queryBuilder.user.findById(1, { with: { invalid: true } })
    // @ts-expect-error invalid relation name
    _queryBuilder.user.findById(1, { with: { posts: true, invalid: true } })
    // @ts-expect-error invalid relation name
    _queryBuilder.user.findById(1, { with: { posts: { comments: true, invalid: true } } })
    // @ts-expect-error invalid relation name
    _queryBuilder.user.findById(1, { with: { posts: { comments: {} } } })
    _queryBuilder.user.findById(1, { with: { posts: { comments: true } } })

    _queryBuilder.post.findById(1)

    // @ts-expect-error invalid type should be number
    _queryBuilder.post.findById('1')
    // @ts-expect-error invalid type should be number
    _queryBuilder.post.findById(null)
    // @ts-expect-error invalid type should be number
    _queryBuilder.post.findById(undefined)
    // @ts-expect-error invalid type should be number
    _queryBuilder.post.findById(true)

    _queryBuilder.post.findById(1, { with: { user: true } })
    // @ts-expect-error invalid relation name
    _queryBuilder.post.findById(1, { with: { user: true, invalid: true } })
    // @ts-expect-error invalid relation name
    _queryBuilder.post.findById(1, { with: { invalid: true } })

    const entityWithoutRelations = defineEntity('entityWithoutRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _queryBuilderWithoutRelations = defineQueryBuilder([entityWithoutRelations])

    _queryBuilderWithoutRelations.entityWithoutRelations.findById(1)
    // @ts-expect-error invalid type should be number
    _queryBuilderWithoutRelations.entityWithoutRelations.findById('1')
    // @ts-expect-error invalid type should be number
    _queryBuilderWithoutRelations.entityWithoutRelations.findById(null)
    // @ts-expect-error invalid type should be number
    _queryBuilderWithoutRelations.entityWithoutRelations.findById(undefined)

    // @ts-expect-error invalid relation name
    _queryBuilderWithoutRelations.entityWithoutRelations.findById(1, { with: { foo: true } })
    // @ts-expect-error invalid with option
    _queryBuilderWithoutRelations.entityWithoutRelations.findById(1, { with: {} })

    const user = _queryBuilder.user.findById(1, {
      with: {
        posts: {
          comments: true,
        },
      },
    })

    expect(user).toEqual(null)

    assertType<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
        comments: Array<{
          id: number
          content: string
          postId: number
        }>
      }>
    } | null>(user)
  })

  it('shoud work with string id', () => {
    const User = defineEntity('user', z.object({
      id: z.string(),
      name: z.string(),
    }))

    const Post = defineEntity('post', z.object({
      id: z.string(),
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
      id: '1',
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
      posts: [{ id: '1', title: 'Post 1', userId: '1' }],
    })
    assertType<{
      id: string
      name: string
      posts: Array<{
        id: string
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

  it('should find by id with deep relations - many', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

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

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
        comments: [{
          id: 1,
          content: 'Comment 1',
          postId: 1,
        }, {
          id: 2,
          content: 'Comment 2',
          postId: 1,
        }],
      }, {
        id: 2,
        title: 'Post 2',
        userId: 1,
        comments: [{
          id: 3,
          content: 'Comment 3',
          postId: 2,
        }],
      }],
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
        id: 2,
        title: 'Post 2',
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

    const userWithPostsAndComments = queryBuilder.user.findById(1, { with: { posts: { comments: true } } })

    expect(userWithPostsAndComments).toEqual({
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
        comments: [
          {
            id: 1,
            content: 'Comment 1',
            postId: 1,
          },
          {
            id: 2,
            content: 'Comment 2',
            postId: 1,
          },
        ],
      }, {
        id: 2,
        title: 'Post 2',
        userId: 1,
        comments: [
          {
            id: 3,
            content: 'Comment 3',
            postId: 2,
          },
        ],
      }],
    })

    assertType<{
      id: number
      name: string
      posts: Array<{
        id: number
        title: string
        userId: number
        comments: Array<{
          id: number
          content: string
          postId: number
        }>
      }>
    } | null>(userWithPostsAndComments)
  })

  it('should find by id with deep relations - one', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const Avatar = defineEntity('avatar', z.object({
      id: z.number(),
      url: z.string(),
      userId: z.number(),
    }))

    const Settings = defineEntity('settings', z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number(),
      isAdmin: z.boolean(),
    }))

    const Preferences = defineEntity('preferences', z.object({
      id: z.number(),
      name: z.string(),
      settingsId: z.number(),
    }))

    const queryBuilder = defineQueryBuilder([User, Avatar, Settings, Preferences], ({ one }) => ({
      user: {
        avatar: one(Avatar, {
          reference: Avatar.fields.userId,
          field: User.fields.id,
        }),
        settings: one(Settings, {
          reference: Settings.fields.userId,
          field: User.fields.id,
        }),
      },
      settings: {
        preferences: one(Preferences, {
          reference: Preferences.fields.settingsId,
          field: Settings.fields.id,
        }),
      },
      preferences: {
        settings: one(Settings, {
          reference: Settings.fields.userId,
          field: User.fields.id,
        }),
      },
      avatar: {
        user: one(User, {
          reference: User.fields.id,
          field: Avatar.fields.userId,
        }),
      },
    }))

    queryBuilder.user.save([{
      id: 1,
      name: 'John Doe',
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
        preferences: {
          id: 1,
          name: 'Preferences',
          settingsId: 1,
        },
      },
      avatar: {
        id: 1,
        url: 'https://example.com/avatar.png',
        userId: 1,
      },
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

    const userWithAvatar = queryBuilder.user.findById(1, { with: { avatar: true } })

    expect(userWithAvatar).toEqual({
      id: 1,
      name: 'John Doe',
      avatar: {
        id: 1,
        url: 'https://example.com/avatar.png',
        userId: 1,
      },
    })

    assertType<{
      id: number
      name: string
      avatar: {
        id: number
        url: string
        userId: number
      }
    } | null>(userWithAvatar)

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

    const userWithPreferences = queryBuilder.user.findById(1, { with: { settings: { preferences: true } } })

    expect(userWithPreferences).toEqual({
      id: 1,
      name: 'John Doe',
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
        preferences: {
          id: 1,
          name: 'Preferences',
          settingsId: 1,
        },
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
    } | null>(userWithPreferences)
  })
})
