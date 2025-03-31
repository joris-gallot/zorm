import { defineQueryBuilder } from '@/orm'
import { Post, User } from './entities'

export const userQuery = defineQueryBuilder(User, ({ many }) => ({
  posts: many(Post, {
    reference: Post.fields.userId,
    field: User.fields.id,
  }),
}))

export const postQuery = defineQueryBuilder(Post, ({ one }) => ({
  user: one(User, {
    reference: User.fields.id,
    field: Post.fields.userId,
  }),
}))
