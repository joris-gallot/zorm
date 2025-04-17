import { defineEntity, defineQueryBuilder } from '@zorm-ts/core'
import { describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { z } from 'zod'
import { useReactivityAdapter } from '../src/index'

describe.skip('reactivity', () => {
  it('findById should not react to changes', () => {
    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, name: 'John' }])

    const user = computed(() => userQuery.findById(1))

    expect(user.value).toEqual({ id: 1, name: 'John' })

    userQuery.save([{ id: 1, name: 'Jane' }])

    expect(user.value).toEqual({ id: 1, name: 'John' })
  })

  it('findById should react to changes', () => {
    useReactivityAdapter()

    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, name: 'John' }])

    const user = computed(() => userQuery.findById(1))

    expect(user.value).toEqual({ id: 1, name: 'John' })

    userQuery.save([{ id: 1, name: 'Jane' }])

    expect(user.value).toEqual({ id: 1, name: 'Jane' })
  })

  it('findById should react to changes with relations', () => {
    useReactivityAdapter()

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
    useReactivityAdapter()

    const User = defineEntity('user', z.object({ id: z.number(), age: z.number() }))

    const { user: userQuery } = defineQueryBuilder([User])

    userQuery.save([{ id: 1, age: 10 }, { id: 2, age: 20 }, { id: 3, age: 30 }])

    const users = computed(() => userQuery.query().where(user => user.age > 10).get())

    expect(users.value).toEqual([{ id: 2, age: 20 }, { id: 3, age: 30 }])

    userQuery.save([{ id: 1, age: 11 }])

    expect(users.value).toEqual([{ id: 1, age: 11 }, { id: 2, age: 20 }, { id: 3, age: 30 }])
  })

  it('where should react to changes with relations', () => {
    useReactivityAdapter()

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
      { id: 3, age: 30 },
    ])

    postQuery.save([{ id: 1, name: 'Post 3', userId: 2 }])

    expect(users.value).toEqual([
      { id: 1, age: 11 },
      { id: 2, age: 20, posts: [{ id: 1, name: 'Post 3', userId: 2 }, { id: 2, name: 'Post 2', userId: 2 }] },
      { id: 3, age: 30 },
    ])
  })
})
