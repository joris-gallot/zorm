# zorm

zorm is a minimalist ORM powered by [Zod](https://zod.dev/). It allows you to define and manipulate entities in a simple and type-safe way, with intuitive relation management.

## Features
- ✅ Type-safe schema definition and validation powered by Zod
- 🔍 Fully typed query builder with:
  - Type-safe field names and operators in where clauses
  - Autocomplete for relation names in eager loading
  - Inferred return types including nested relations
- 🤝 Support for one-to-one and one-to-many relationships
- 🚀 Eager loading of related entities
- 🛡️ Runtime validation through Zod schemas
- ⚡️ Reactivity support for Vue (other frameworks planned)

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
```

### Create a Query Builder from relations
```ts
import { defineQueryBuilder } from '@zorm-ts/core'
import { Post, User } from './entities'

export const userQuery = defineQueryBuilder(User, ({ many }) => ({
  posts: many(Post, {
    reference: Post.fields.userId,
    field: User.fields.id,
  }),
}))

const users = userQuery.query()
  .where(user => user.age > 18)
  .orWhere(user => user.isAdmin)
  .get()
/*
[{
  id: number
  email: string
  age: number
  username?: string
  isAdmin: boolean
}]
*/

const usersWithPosts = userQuery.query()
  .where(user => user.age > 18)
  .orWhere(user => user.isAdmin)
  .with('posts')
  .get()
/*
[{
  id: number
  email: string
  age: number
  username?: string
  isAdmin: boolean
  posts: Array<{
    id: number
    title: string
    userId: number
  }>
}]
*/
```

## Reactivity

Currently it only handles reactivity through Vue integration (see [Vue integration example](packages/vue/src/index.ts)), but support for other frameworks will be added.

### Vue

zorm provides first-class support for Vue through the `@zorm-ts/vue` package. This integration enables reactive queries that automatically update your components when the data changes.

```sh
npm install @zorm-ts/vue
```

For detailed Vue integration instructions, check out the [@zorm-ts/vue documentation](packages/vue/README.md).

## License
MIT
