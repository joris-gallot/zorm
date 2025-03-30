import { defineEntity } from '@/orm'
import { z } from 'zod'

export const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    age: z.number().optional(),
  }),
)

export const Post = defineEntity(
  'post',
  z.object({
    id: z.number(),
    title: z.string(),
    userId: z.number(),
  }),
)
