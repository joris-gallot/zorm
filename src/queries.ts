import { defineQueryBuilder } from '@/orm'
import { Post, User } from './entities'

export const userQuery = defineQueryBuilder(User, ({ hasMany }) => ({
  posts: hasMany(Post, {
    reference: Post.fields.userId,
    field: User.fields.id,
  }),
}))

export const postQuery = defineQueryBuilder(Post, ({ hasOne }) => ({
  user: hasOne(User, {
    reference: User.fields.id,
    field: Post.fields.userId,
  }),
}))
