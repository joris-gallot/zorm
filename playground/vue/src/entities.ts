import { z } from 'zod'
import { defineEntity } from 'zorm'

export const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    age: z.number().optional(),
  }),
)

export const Post = defineEntity(
  'post',
  z.object({
    id: z.number(),
    title: z.string().max(10),
    userId: z.number(),
  }),
)
