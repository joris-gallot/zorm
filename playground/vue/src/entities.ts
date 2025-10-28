import { defineEntity } from '@zorm-ts/core'
import { useReactiveDatabase } from '@zorm-ts/vue'
import { z } from 'zod'

useReactiveDatabase({ localStorage: false })

export const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    name: z.string(),
    email: z.email(),
    age: z.number().optional(),
  }),
)

export const Post = defineEntity(
  'post',
  z.object({
    id: z.number(),
    title: z.string().max(10),
    userId: z.number(),
    imageId: z.number(),
  }),
)

export const Image = defineEntity(
  'image',
  z.object({
    id: z.number(),
    url: z.string().optional(),
  }),
)

export const Comment = defineEntity(
  'comment',
  z.object({
    id: z.number(),
    content: z.string(),
    postId: z.number(),
  }),
)
