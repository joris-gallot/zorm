---
outline: deep
---

# Why?

zorm was created to solve common challenges in modern web applications when dealing with complex, relational data structures, Redux's excellent article on [Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape/) perfectly describes these difficulties and explains how to design normalized state. zorm takes these concepts further by adding type safety and a more intuitive API.

## The Problem with Nested Data

Many applications deal with data that is nested or relational in nature. For example, a blog application might have:

```ts
const blogPosts = [
  {
    id: 1,
    author: {
      id: 1,
      name: 'User 1',
      email: 'user1@example.com'
    },
    title: 'First Post',
    comments: [
      {
        id: 1,
        author: {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com'
        },
        content: 'Great post!'
      }
    ]
  }
]
```

This nested structure presents several challenges:

- 🔄 **Data Duplication**: The same user data might be repeated across multiple posts and comments
- 🐌 **Performance Issues**: Deeply nested updates require copying and updating all parent objects
- 🎯 **Complex Updates**: Modifying a single piece of data requires traversing the entire structure
- 🧩 **Type Safety**: Maintaining type safety across nested structures becomes increasingly difficult

## How zorm Solves These Problems

zorm provides a solution through a normalized, type-safe approach:

### 1. 🛡️ Type-Safe Schema Definition

```ts
const User = defineEntity(
  'user',
  z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email()
  })
)

const Post = defineEntity(
  'post',
  z.object({
    id: z.number(),
    title: z.string(),
    authorId: z.number()
  })
)

const Comment = defineEntity(
  'comment',
  z.object({
    id: z.number(),
    content: z.string(),
    authorId: z.number(),
    postId: z.string()
  })
)
```

### 2. 🔍 Normalized Data Structure

zorm automatically handles the normalization of your data:

```json
// Instead of nested data, you get:
{
  "user": {
    "1": { "id": 1, "name": "User 1", "email": "user1@example.com" },
    "2": { "id": 2, "name": "User 2", "email": "user2@example.com" }
  },
  "post": {
    "1": { "id": 1, "title": "First Post", "authorId": 1 }
  },
  "comment": {
    "1": { "id": 1, "content": "Great post!", "authorId": 2, "postId": 1 }
  }
}
```

### 3. 🤝 Intuitive Relations

zorm makes it easy to work with relationships:

```ts
const { post: postQuery } = defineQueryBuilder(
  [Post, User, Comment],
  ({ one, many }) => ({
    post: {
      author: one(User, {
        reference: Post.fields.authorId,
        field: User.fields.id,
      }),
      comments: many(Comment, {
        reference: Comment.fields.postId,
        field: Post.fields.id,
      })
    }
  })
)

// Query with relations
const posts = postQuery.query()
  .with({
    author: true,
    comments: true
  })
  .get()
```

## Benefits of Using zorm

- ⚡ **Performance**: Normalized data structure means updates only affect the changed data
- 🎯 **Type Safety**: Full TypeScript support with Zod validation
- 🔄 **Maintainability**: Clear separation of concerns and predictable data structure
- 🚀 **Developer Experience**: Intuitive API with autocomplete support
- 🎨 **Framework Integration**: Seamless integration with popular frameworks

## When to Use zorm

zorm is particularly useful when:

- Your application deals with complex, relational data
- You need type safety and runtime validation
- You want to avoid data duplication and inconsistency
- You need to optimize performance with normalized data structures
- You're working with modern frameworks that benefit from reactive data management

## Next Steps

- [Getting Started](/guide/getting-started) - Learn how to set up zorm in your project
- [Entity Definition](/guide/entities) - Learn how to define and validate your entities
- [Query Builder](/guide/query-builder) - Master the query builder API
- [Relations](/guide/relations) - Understand how to work with relationships
