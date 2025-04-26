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
      // @ts-expect-error can't use a recursive relation
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

    const usersWithPosts = queryBuilder.user.query()
      .with({ posts: true })
      .where(user => user.name === 'John Doe')
      .get()

    expect(usersWithPosts).toEqual([{
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
    }>>(usersWithPosts)

    const usersWithFalsePosts = queryBuilder.user.query().with({ posts: false }).get()

    expect(usersWithFalsePosts).toEqual([{
      id: 1,
      name: 'John Doe',
    }, {
      id: 2,
      name: 'Jane Doe',
    }])

    assertType<Array<{
      id: number
      name: string
    }>>(usersWithFalsePosts)

    const usersWithUndefinedPosts = queryBuilder.user.query()
      .with({ posts: undefined })
      .get()

    expect(usersWithUndefinedPosts).toEqual([{
      id: 1,
      name: 'John Doe',
    }, {
      id: 2,
      name: 'Jane Doe',
    }])

    assertType<Array<{
      id: number
      name: string
    }>>(usersWithUndefinedPosts)

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
      queryBuilder.user.query().with({ posts: true }).get(),
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

    const usersWithPostsAndSettings = queryBuilder.user.query()
      .where(user => user.name === 'John Doe')
      .with({ posts: true, settings: true })
      .get()

    expect(usersWithPostsAndSettings).toEqual([{
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
    }>>(usersWithPostsAndSettings)

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

  it('should work with deeply nested relations', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
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
      isDarkMode: z.boolean(),
    }))

    const Notification = defineEntity('notification', z.object({
      id: z.number(),
      name: z.string(),
      preferencesId: z.number(),
      isRead: z.boolean(),
    }))

    const queryBuilder = defineQueryBuilder([User, Settings, Preferences, Notification], ({ one, many }) => ({
      user: {
        settings: one(Settings, {
          reference: Settings.fields.userId,
          field: User.fields.id,
        }),
      },
      settings: {
        user: one(User, {
          reference: User.fields.id,
          field: Settings.fields.userId,
        }),
        preferences: one(Preferences, {
          reference: Preferences.fields.settingsId,
          field: Settings.fields.id,
        }),
      },
      preferences: {
        settings: one(Settings, {
          reference: Settings.fields.id,
          field: Preferences.fields.settingsId,
        }),
        notifications: many(Notification, {
          reference: Notification.fields.preferencesId,
          field: Preferences.fields.id,
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
          name: 'Dark Mode',
          settingsId: 1,
          isDarkMode: true,
        },
      },
    }])

    queryBuilder.notification.save([{
      id: 1,
      name: 'Notification 1',
      preferencesId: 1,
      isRead: false,
    }])

    const usersWithNestedRelations = queryBuilder.user.query()
      .with({ settings: { preferences: { notifications: true } } })
      .get()

    expect(usersWithNestedRelations).toEqual([{
      id: 1,
      name: 'John Doe',
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
        preferences: {
          id: 1,
          name: 'Dark Mode',
          settingsId: 1,
          isDarkMode: true,
          notifications: [{
            id: 1,
            name: 'Notification 1',
            preferencesId: 1,
            isRead: false,
          }],
        },
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
        preferences: {
          id: number
          name: string
          settingsId: number
          isDarkMode: boolean
          notifications: Array<{
            id: number
            name: string
            preferencesId: number
            isRead: boolean
          }>
        }
      }
    }>>(usersWithNestedRelations)

    const usersWithFalseNotifications = queryBuilder.user.query()
      .with({ settings: { preferences: { notifications: false } } })
      .get()

    expect(usersWithFalseNotifications).toEqual([{
      id: 1,
      name: 'John Doe',
      settings: {
        id: 1,
        name: 'Admin',
        userId: 1,
        isAdmin: true,
        preferences: {
          id: 1,
          name: 'Dark Mode',
          settingsId: 1,
          isDarkMode: true,
        },
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
        preferences: {
          id: number
          name: string
          settingsId: number
          isDarkMode: boolean
        }
      }
    }>>(usersWithFalseNotifications)
  })

  it('should work with many-to-many relationships', () => {
    const Post = defineEntity('post', z.object({
      id: z.number(),
      title: z.string(),
    }))

    const Tag = defineEntity('tag', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const PostTag = defineEntity('postTag', z.object({
      id: z.number(),
      postId: z.number(),
      tagId: z.number(),
    }))

    const queryBuilder = defineQueryBuilder([Post, Tag, PostTag], ({ many, one }) => ({
      post: {
        postTags: many(PostTag, {
          reference: PostTag.fields.postId,
          field: Post.fields.id,
        }),
      },
      tag: {
        postTags: many(PostTag, {
          reference: PostTag.fields.tagId,
          field: Tag.fields.id,
        }),
      },
      postTag: {
        post: one(Post, {
          reference: Post.fields.id,
          field: PostTag.fields.postId,
        }),
        tag: one(Tag, {
          reference: Tag.fields.id,
          field: PostTag.fields.tagId,
        }),
      },
    }))

    queryBuilder.post.save([{
      id: 1,
      title: 'Post 1',
    }, {
      id: 2,
      title: 'Post 2',
    }])

    queryBuilder.tag.save([{
      id: 1,
      name: 'Tech',
    }, {
      id: 2,
      name: 'News',
    }])

    queryBuilder.postTag.save([{
      id: 1,
      postId: 1,
      tagId: 1,
    }, {
      id: 2,
      postId: 1,
      tagId: 2,
    }, {
      id: 3,
      postId: 2,
      tagId: 1,
    }])

    const postsWithPostTags = queryBuilder.post.query()
      .with({ postTags: { tag: true } })
      .get()

    expect(postsWithPostTags).toEqual([
      {
        id: 1,
        title: 'Post 1',
        postTags: [
          {
            id: 1,
            postId: 1,
            tagId: 1,
            tag: {
              id: 1,
              name: 'Tech',
            },
          },
          {
            id: 2,
            postId: 1,
            tagId: 2,
            tag: {
              id: 2,
              name: 'News',
            },
          },
        ],
      },
      {
        id: 2,
        title: 'Post 2',
        postTags: [
          {
            id: 3,
            postId: 2,
            tagId: 1,
            tag: {
              id: 1,
              name: 'Tech',
            },
          },
        ],
      },
    ])

    assertType<Array<{
      id: number
      title: string
      postTags: Array<{
        id: number
        postId: number
        tagId: number
        tag: {
          id: number
          name: string
        }
      }>
    }>>(postsWithPostTags)

    const tagsWithPostTags = queryBuilder.tag.query()
      .with({ postTags: { post: true } })
      .get()

    expect(tagsWithPostTags).toEqual([
      {
        id: 1,
        name: 'Tech',
        postTags: [
          {
            id: 1,
            postId: 1,
            tagId: 1,
            post: {
              id: 1,
              title: 'Post 1',
            },
          },
          {
            id: 3,
            postId: 2,
            tagId: 1,
            post: {
              id: 2,
              title: 'Post 2',
            },
          },
        ],
      },
      {
        id: 2,
        name: 'News',
        postTags: [
          {
            id: 2,
            postId: 1,
            tagId: 2,
            post: {
              id: 1,
              title: 'Post 1',
            },
          },
        ],
      },
    ])

    assertType<Array<{
      id: number
      name: string
      postTags: Array<{
        id: number
        postId: number
        tagId: number
        post: {
          id: number
          title: string
        }
      }>
    }>>(tagsWithPostTags)
  })
})
