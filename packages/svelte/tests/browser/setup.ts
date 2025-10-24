import type { SvelteDatabaseOptions } from '../../src'
import { defineEntity, defineQueryBuilder, LOCAL_STORAGE_KEY } from '@zorm-ts/core'
import { z } from 'zod'
import { useReactiveDatabase } from '../../src'

export const defaultDbData = {
  image: {},
  post: {
    1: {
      id: 1,
      title: 'Post 1',
      userId: 1,
      imageId: 1,
    },
    2: {
      id: 2,
      title: 'Post 2',
      userId: 1,
      imageId: 2,
    },
    3: {
      id: 3,
      title: 'Post 3',
      userId: 2,
      imageId: 3,
    },
  },
  user: {
    1: {
      id: 1,
      name: 'John',
      email: 'john@doe.com',
      age: 10,
    },
    2: {
      id: 2,
      name: 'Jane',
      email: 'jane@doe.com',
      age: 20,
    },
    3: {
      id: 3,
      name: 'Jim',
      email: 'jim@beam.com',
      age: 30,
    },
  },
}

export function setup({
  reactive,
  initFromLocalStorage = false,
  databaseOptions,
}: {
  reactive: boolean
  initFromLocalStorage?: boolean
  databaseOptions?: SvelteDatabaseOptions
}) {
  // init from local storage before adding entities
  if (initFromLocalStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDbData))
  }

  if (reactive) {
    useReactiveDatabase(databaseOptions)
  }

  const User = defineEntity(
    'user',
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.email(),
      age: z.number().optional(),
    }),
  )

  const Post = defineEntity(
    'post',
    z.object({
      id: z.number(),
      title: z.string().max(10),
      userId: z.number(),
      imageId: z.number(),
    }),
  )

  const Image = defineEntity(
    'image',
    z.object({
      id: z.number(),
      url: z.string().optional(),
    }),
  )

  const { user: userQuery, post: postQuery } = defineQueryBuilder([User, Post, Image], ({ one, many }) => ({
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
      image: one(Image, {
        reference: Post.fields.imageId,
        field: Image.fields.id,
      }),
    },
  }))

  if (!initFromLocalStorage) {
    postQuery.save(Object.values(defaultDbData.post))
    userQuery.save(Object.values(defaultDbData.user))
  }

  return {
    userQuery,
    postQuery,
  }
}
