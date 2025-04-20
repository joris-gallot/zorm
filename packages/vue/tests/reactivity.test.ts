import { DefaultDatabase, defineEntity, defineQueryBuilder, defineReactivityDatabase, getDb } from '@zorm-ts/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { z } from 'zod'
import { useReactiveDatabase, VueDatabase } from '../src/index'

describe('reactivity', () => {
  beforeEach(() => {
    // reset to default database
    defineReactivityDatabase(new DefaultDatabase())
  })

  it('findById should not react to changes', () => {
    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, name: 'John' }])

    const user = computed(() => userQuery.findById(1))

    expect(user.value).toEqual({ id: 1, name: 'John' })

    userQuery.save([{ id: 1, name: 'Jane' }])

    expect(user.value).toEqual({ id: 1, name: 'John' })
  })

  it('should update db instance', () => {
    expect(getDb()).toBeInstanceOf(DefaultDatabase)

    useReactiveDatabase()

    expect(getDb()).toBeInstanceOf(VueDatabase)
  })

  it('shoud keep db data after init reactive database', () => {
    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, name: 'John' }])

    expect(getDb().getData()).toEqual({
      user: {
        1: { id: 1, name: 'John' },
      },
    })

    useReactiveDatabase()

    expect(getDb().getData()).toEqual({
      user: {
        1: { id: 1, name: 'John' },
      },
    })
  })

  it('findById should react to changes', () => {
    useReactiveDatabase()

    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, name: 'John' }])

    const user = computed(() => userQuery.findById(1))

    expect(user.value).toEqual({ id: 1, name: 'John' })

    userQuery.save([{ id: 1, name: 'Jane' }])

    expect(user.value).toEqual({ id: 1, name: 'Jane' })

    const nullUser = computed(() => userQuery.findById(2))

    expect(nullUser.value).toBeNull()
  })

  it('findById should react to changes with relations', () => {
    useReactiveDatabase()

    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
    }))
    const Post = defineEntity('post', z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number(),
    }))

    const { user: userQuery, post: postQuery } = defineQueryBuilder([User, Post], ({ many }) => ({
      user: {
        posts: many(Post, {
          field: User.fields.id,
          reference: Post.fields.userId,
        }),
      },
    }))

    userQuery.save([{ id: 1, name: 'John' }])
    postQuery.save([{ id: 1, name: 'Post 1', userId: 1 }])

    const user = computed(() => userQuery.findById(1, { with: { posts: true } }))

    expect(user.value).toEqual({ id: 1, name: 'John', posts: [{ id: 1, name: 'Post 1', userId: 1 }] })

    postQuery.save([{ id: 1, name: 'Post 2', userId: 1 }])

    expect(user.value).toEqual({ id: 1, name: 'John', posts: [{ id: 1, name: 'Post 2', userId: 1 }] })
  })

  it('where should react to changes', () => {
    useReactiveDatabase()

    const User = defineEntity('user', z.object({ id: z.number(), age: z.number() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, age: 10 }, { id: 2, age: 20 }, { id: 3, age: 30 }])

    const users = computed(() => userQuery.query().where(user => user.age > 10).get())

    expect(users.value).toEqual([{ id: 2, age: 20 }, { id: 3, age: 30 }])

    userQuery.save([{ id: 1, age: 11 }])

    expect(users.value).toEqual([{ id: 1, age: 11 }, { id: 2, age: 20 }, { id: 3, age: 30 }])
  })

  it('where should react to changes with relations', () => {
    useReactiveDatabase()

    const User = defineEntity('user', z.object({
      id: z.number(),
      age: z.number(),
    }))
    const Post = defineEntity('post', z.object({
      id: z.number(),
      name: z.string(),
      userId: z.number(),
    }))

    const { user: userQuery, post: postQuery } = defineQueryBuilder([User, Post], ({ many }) => ({
      user: {
        posts: many(Post, {
          field: User.fields.id,
          reference: Post.fields.userId,
        }),
      },
    }))

    userQuery.save([{ id: 1, age: 10 }, { id: 2, age: 20 }, { id: 3, age: 30 }])
    postQuery.save([{ id: 1, name: 'Post 1', userId: 2 }, { id: 2, name: 'Post 2', userId: 2 }])

    const users = computed(() => userQuery.query()
      .where(user => user.age > 10)
      .with({ posts: true })
      .get(),
    )

    expect(users.value).toEqual([
      {
        id: 2,
        age: 20,
        posts: [{ id: 1, name: 'Post 1', userId: 2 }, { id: 2, name: 'Post 2', userId: 2 }],
      },
      { id: 3, age: 30, posts: [] },
    ])

    userQuery.save([{ id: 1, age: 11 }])
    postQuery.save([{ id: 1, name: 'Post 3', userId: 2 }])

    expect(users.value).toEqual([
      { id: 1, age: 11, posts: [] },
      { id: 2, age: 20, posts: [{ id: 1, name: 'Post 3', userId: 2 }, { id: 2, name: 'Post 2', userId: 2 }] },
      { id: 3, age: 30, posts: [] },
    ])
  })
})
