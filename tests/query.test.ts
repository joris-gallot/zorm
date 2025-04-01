import { defineEntity, defineQueryBuilder } from '@/orm'
import { assertType, describe, it } from 'vitest'
import { z } from 'zod'

describe('query', () => {
  it('findById', () => {
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

    const _userQuery = defineQueryBuilder(User, ({ many, one }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
      settings: one(Settings, {
        reference: Settings.fields.userId,
        field: User.fields.id,
      }),
    }))

    const _postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    assertType<Parameters<typeof _userQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>({})
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>(undefined)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>(true)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _userQuery.findById>[0]>([])

    assertType<Parameters<typeof _userQuery.findById>[1]>({ with: ['posts'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _userQuery.findById>[1]>({ with: ['invalid'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _userQuery.findById>[1]>({ with: ['posts', 'invalid'] })

    assertType<Parameters<typeof _postQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>(undefined)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _postQuery.findById>[0]>(true)

    assertType<Parameters<typeof _postQuery.findById>[1]>({ with: ['user'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _postQuery.findById>[1]>({ with: ['user', 'invalid'] })
    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _postQuery.findById>[1]>({ with: ['invalid'] })

    const entityWithRelations = defineEntity('entityWithRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _entityWithRelationsQuery = defineQueryBuilder(entityWithRelations)

    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>(1)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>('1')
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>(null)
    // @ts-expect-error invalid type should be number
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[0]>(undefined)

    // @ts-expect-error invalid relation name
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[1]>({ with: ['foo'] })
    assertType<Parameters<typeof _entityWithRelationsQuery.findById>[1]>({ with: [] })
  })

  it('save', () => {
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

    const _userQuery = defineQueryBuilder(User, ({ many, one }) => ({
      posts: many(Post, {
        reference: Post.fields.userId,
        field: User.fields.id,
      }),
      settings: one(Settings, {
        reference: Settings.fields.userId,
        field: User.fields.id,
      }),
    }))

    const _postQuery = defineQueryBuilder(Post, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Post.fields.userId,
      }),
    }))

    const _settingsQuery = defineQueryBuilder(Settings, ({ one }) => ({
      user: one(User, {
        reference: User.fields.id,
        field: Settings.fields.userId,
      }),
    }))

    /* user */
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
    }])
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      posts: [{
        id: 1,
        title: 'Post 1',
        userId: 1,
      }],
    }])
    assertType<Parameters<typeof _userQuery.save>[0]>([{
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
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error invalid object should be a post
      posts: [{}],
      // @ts-expect-error invalid object should be a settings
      settings: [{}],
    }])
    // @ts-expect-error missing id
    assertType<Parameters<typeof _userQuery.save>[0]>([{
      name: 'John Doe',
    }])

    /* post */
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
      userId: 1,
    }])
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
      userId: 1,
      // @ts-expect-error invalid object should be a user
      user: [{}],
    }])
    // @ts-expect-error missing id
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      title: 'Post 1',
      userId: 1,
    }])
    // @ts-expect-error missing userId
    assertType<Parameters<typeof _postQuery.save>[0]>([{
      id: 1,
      title: 'Post 1',
    }])

    /* settings */
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
    }])
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      id: 1,
      name: 'Admin',
      userId: 1,
      isAdmin: true,
      user: {
        id: 1,
        name: 'John Doe',
      },
    }])
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      id: 1,
      name: 'Admin',
      // @ts-expect-error invalid object should be a user
      user: [{}],
    }])
    // @ts-expect-error missing id
    assertType<Parameters<typeof _settingsQuery.save>[0]>([{
      name: 'Admin',
    }])

    const entityWithoutRelations = defineEntity('entityWithoutRelations', z.object({
      id: z.number(),
      name: z.string(),
    }))

    const _entityWithoutRelationsQuery = defineQueryBuilder(entityWithoutRelations)

    assertType<Parameters<typeof _entityWithoutRelationsQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
    }])

    assertType<Parameters<typeof _entityWithoutRelationsQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have relations
      foo: [],
    }])

    assertType<Parameters<typeof _entityWithoutRelationsQuery.save>[0]>([{
      id: 1,
      name: 'John Doe',
      // @ts-expect-error should not have relations
      bar: {},
    }])
  })
})
