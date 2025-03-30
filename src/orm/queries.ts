import { defineQueryBuilder } from '@/composables/defineEntity'
import { Post, User } from './entities'

export const userQueryBuilder = defineQueryBuilder(User, ({ hasMany }) => ({
  posts: hasMany(Post, {
    reference: Post.fields.id,
    field: User.fields.id,
  }),
}))

export const postQueryBuilder = defineQueryBuilder(Post, ({ hasOne }) => ({
  user: hasOne(User, {
    reference: User.fields.id,
    field: Post.fields.userId,
  }),
}))
