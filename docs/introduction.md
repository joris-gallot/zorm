---
outline: deep
---

# Introduction

zorm is a minimalist, type-safe ORM powered by [Zod](https://zod.dev/). It provides a simple yet powerful way to define and manipulate entities in your application, with full TypeScript support and intuitive relation management.

## Why zorm?

- 🛡️ **Type Safety**: Built on top of Zod, zorm ensures your data is always type-safe and validated at runtime
- 🔍 **Simple API**: Intuitive query builder with full autocomplete support
- 🤝 **Flexible Relations**: Easy management of one-to-one, one-to-many, and many-to-many relationships
- ⚡ **Framework Agnostic**: Core functionality is framework-agnostic, with dedicated packages for popular frameworks

## Quick Start

```ts twoslash
import { defineEntity, defineQueryBuilder } from '@zorm-ts/core'
import { z } from 'zod'

// Define your entities
const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string()
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

## Integrations

zorm provides dedicated packages for popular frameworks:

- **SolidJS**: `@zorm-ts/solidjs`
- **Svelte**: `@zorm-ts/svelte`
- **Vue**: `@zorm-ts/vue`

Each integration package provides reactive bindings that work seamlessly with the framework's reactivity system.

## Installation

```bash
# Core package
npm install @zorm-ts/core

# Framework integrations for reactivity (optional)
npm install @zorm-ts/solidjs  # For SolidJS
npm install @zorm-ts/svelte   # For Svelte
npm install @zorm-ts/vue      # For Vue
```

## Next Steps

- [Getting Started](/guide/getting-started) - Learn how to set up zorm in your project
- [Entity Definition](/guide/entities) - Learn how to define and validate your entities
- [Query Builder](/guide/query-builder) - Master the query builder API
- [Relations](/guide/relations) - Understand how to work with relationships
- [Framework Integration](/guide/framework-integration) - Learn how to use zorm with your favorite framework
