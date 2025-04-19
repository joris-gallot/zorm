import { defineQueryBuilder } from '@zorm-ts/core'
import { Comment, Post, User } from './entities.js'

export const queryBuilder = defineQueryBuilder([User, Post, Comment], ({ many }) => ({
  user: {
    posts: many(Post, {
      reference: Post.fields.userId,
      field: User.fields.id,
    }),
  },
  post: {
    comments: many(Comment, {
      reference: Comment.fields.postId,
      field: Post.fields.id,
    }),
  },
}))

const users = queryBuilder.user.query()
  .where(user => user.email.endsWith('@foo.com'))
  .orWhere(user => user.email === 'admin@bar.com')
  .get()

const usersWithPosts = queryBuilder.user.query()
  .where(user => user.email.endsWith('@foo.com'))
  .orWhere(user => user.email === 'admin@bar.com')
  .with({
    posts: {
      comments: true,
    },
  })
  .get()
