# zorm

zorm is a minimalist ORM powered by [Zod](https://zod.dev/). It allows you to define and manipulate entities in a simple and type-safe way, with intuitive relation management.

Currently, it is designed specifically for Vue but is planned to become framework-agnostic.

## Features
- ✅  Type-safe schema definition and validation powered by Zod
- 🔍  Fully typed query builder with:
  - Type-safe field names and operators in where clauses
  - Autocomplete for relation names in eager loading
  - Inferred return types including nested relations
- 🤝  Support for one-to-one and one-to-many relationships
- 🚀  Eager loading of related entities
- 🛡️  Runtime validation of data through Zod schemas

## Installation
(Currently not published)

## Usage

### Define Entities
```ts
import { z } from 'zod'
import { defineEntity } from 'zorm'

export const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    age: z.number().optional(),
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
import { defineQueryBuilder } from 'zorm'
import { Post, User } from './entities'

export const userQuery = defineQueryBuilder(User, ({ many }) => ({
  posts: many(Post, {
    reference: Post.fields.userId,
    field: User.fields.id,
  }),
}))

const user = userQuery.query()
  .where('age', '>', 18)
  .where('isAdmin', '=', false)
  .get()
/*
[{
  id: number
  firstName: string
  lastName: string
  age?: number
}]
*/

const userWithPosts = userQuery.findById(1, { with: ['posts'] })
/*
{
  id: number
  firstName: string
  lastName: string
  age?: number
  posts: Array<{
    id: number
    title: string
    userId: number
  }>
}
*/
```

## License
MIT
