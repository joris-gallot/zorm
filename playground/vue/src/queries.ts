import { defineQueryBuilder } from 'zorm'
import { Post, User } from './entities.js'

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
