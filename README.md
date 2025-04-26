# zorm

zorm is a minimalist ORM powered by [Zod](https://zod.dev/). It allows you to define and manipulate entities in a simple and type-safe way, with intuitive relation management.

## Features
- ✅ Type-safe schema definition and validation powered by Zod
- 🔍 Fully typed query builder with:
  - Autocomplete for relation names in eager loading
  - Inferred return types including nested relations
- 🤝 Support for one-to-one, one-to-many and many-to-many relationships
- 🚀 Eager loading of related entities
- 🛡️ Runtime validation through Zod schemas
- ⚡️ [Reactivity support](#reactivity)

## Installation
```sh
npm install @zorm-ts/core
```
## Usage

### Define Entities
```ts
import { defineEntity } from '@zorm-ts/core'
import { z } from 'zod'

export const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    email: z.string().email(),
    age: z.number(),
    username: z.string().optional(),
    isAdmin: z.boolean()
  })
)

export const Post = defineEntity(
  'post',
  z.object({
    id: z.number(),
    title: z.string(),
    userId: z.number(),
  })
)

export const Comment = defineEntity(
  'comment',
  z.object({
    id: z.number(),
    content: z.string(),
    postId: z.number(),
  })
)
```

### Create a Query Builder
```ts
import { defineQueryBuilder } from '@zorm-ts/core'
import { Comment, Post, User } from './entities'

const { user: userQuery } = defineQueryBuilder([User, Post, Comment], ({ many }) => ({
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

const users = userQuery.query()
  .where(user => user.email.endsWith('@foo.com'))
  .orWhere(user => user.email === 'admin@bar.com')
  .get()
/*
{
  id: number;
  name: string;
  email: string;
  age?: number | undefined;
}[]
*/

const usersWithPosts = userQuery.query()
  .where(user => user.email.endsWith('@foo.com'))
  .orWhere(user => user.email === 'admin@bar.com')
  .with({
    posts: {
      comments: true,
    },
  })
  .get()
/*
{
  id: number;
  name: string;
  email: string;
  age?: number | undefined;
  posts: {
    id: number;
    title: string;
    userId: number;
    imageId: number;
    comments: {
      id: number;
      content: string;
      postId: number;
    }[];
  }[];
}[]
*/
```

## Reactivity

Reactivity is handled through dedicated integration packages, external to `@zorm-ts/core`, this allows zorm to integrate seamlessly with various frontend frameworks' reactivity systems.

Currently, the following integrations are available:

-   **Solidjs:** `@zorm-ts/solidjs` - [Documentation](packages/solidjs/README.md)
-   **Svelte:** `@zorm-ts/svelte` - [Documentation](packages/svelte/README.md)
-   **Vue:** `@zorm-ts/vue` - [Documentation](packages/vue/README.md)

Support for other frameworks is planned.

## License
MIT
