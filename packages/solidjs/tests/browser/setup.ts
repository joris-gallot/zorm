import { defineEntity, defineQueryBuilder } from '@zorm-ts/core'
import { z } from 'zod'
import { useReactiveDatabase } from '../../src'

export function setup({ reactive }: { reactive: boolean }) {
  if (reactive) {
    useReactiveDatabase()
  }

  const User = defineEntity(
    'user',
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
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

  postQuery.save([{
    id: 1,
    title: 'Post 1',
    userId: 1,
    imageId: 1,
  }, {
    id: 2,
    title: 'Post 2',
    userId: 1,
    imageId: 2,
  }, {
    id: 3,
    title: 'Post 3',
    userId: 2,
    imageId: 3,
    user: {
      id: 2,
      name: 'Jane',
      email: 'jane@doe.com',
      age: 20,
    },
  }])

  userQuery.save([
    {
      id: 1,
      name: 'John',
      email: 'john@doe.com',
      age: 10,
      posts: [
        {
          id: 2,
          title: 'Post 2',
          userId: 1,
          imageId: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Jane',
      email: 'jane@doe.com',
      age: 20,
    },
    {
      id: 3,
      name: 'Jim',
      email: 'jim@beam.com',
      age: 30,
    },
  ])

  return {
    userQuery,
    postQuery,
  }
}
