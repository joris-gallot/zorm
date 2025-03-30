# Zorm

Zorm is a minimalist ORM based on [Zod](https://zod.dev/). It allows you to define and manipulate entities in a simple and type-safe way, with intuitive relation management.

Currently, it is designed specifically for Vue but is planned to become framework-agnostic.

## Features
- **Strong validation and typing** with Zod
- **Relations** (`hasOne`, `hasMany`)

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

export const userQueryBuilder = defineQueryBuilder(User, ({ hasMany }) => ({
  posts: hasMany(Post, {
    reference: Post.fields.userId,
    field: User.fields.id,
  }),
}))

const user = userQueryBuilder.findById(1, { with: ['posts'] })
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
````

## License
MIT
