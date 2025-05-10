---
outline: deep
---

# Getting Started

Zorm is a type-safe ORM (Object-Relational Mapping) library powered by [Zod](https://zod.dev/) for schema validation and provides a powerful query builder API. Designed with a focus on type safety and developer experience, Zorm offers an intuitive relation system and integrates seamlessly with Vue, SolidJS, and Svelte (for now).

## Installation

```bash
npm install @zorm-ts/core
```

### Reactivity (optional)

zorm provides dedicated packages for popular frameworks:

- **SolidJS**: `@zorm-ts/solidjs`
- **Svelte**: `@zorm-ts/svelte`
- **Vue**: `@zorm-ts/vue`

Each integration package provides reactive bindings that work seamlessly with the framework's reactivity system.

```bash
npm install @zorm-ts/solidjs  # For SolidJS
npm install @zorm-ts/svelte   # For Svelte
npm install @zorm-ts/vue      # For Vue
```

## Example

```ts twoslash
import { defineEntity, defineQueryBuilder } from '@zorm-ts/core'
import { z } from 'zod'

// Define your entities
const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string().optional()
  })
)

const Post = defineEntity(
  'post',
  z.object({
    id: z.number(),
    title: z.string(),
    userId: z.number()
  })
)

// Create a query builder
const { user: userQuery } = defineQueryBuilder([User, Post], ({ many }) => ({
  user: {
    posts: many(Post, {
      reference: Post.fields.userId,
      field: User.fields.id,
    }),
  },
}))

// Query your data
const users = userQuery.query()
  .where(user => user.email.endsWith('@example.com'))
  .get()

const usersWithPosts = userQuery.query()
  .where(user => user.email.endsWith('@example.com'))
  .with({
    posts: true
  })
  .get()
```

## Next Steps

- [Entity Definition](/guide/entities) - Learn how to define and validate your entities
- [Query Builder](/guide/query-builder) - Master the query builder API
- [Relations](/guide/relations) - Understand how to work with relationships
- [Framework Integration](/guide/framework-integration) - Learn how to use zorm with your favorite framework
