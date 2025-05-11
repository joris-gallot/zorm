---
outline: deep
---

# SolidJS Integration

## Installation

```bash
npm install @zorm-ts/solidjs
```

## Usage

Initialize the SolidJS reactive database as early as possible in your application, ideally before any entity definitions. The main application file is a good place for this:

```typescript
import { useReactiveDatabase } from '@zorm-ts/solidjs'

// Initialize the Solidjs reactive database
useReactiveDatabase()

// Use in your Solidjs components
const users = createMemo(() => userQuery.query().get()) // Will be reactive!
```

## Example Component

Here's a complete example of using zorm in a SolidJS component:

```tsx
import { createMemo } from 'solid-js'
import { userQuery } from './your-query-builder'

function UserList() {
  // Reactive query that will update when data changes
  const users = createMemo(() => userQuery.query()
    .where(user => user.email.endsWith('@example.com'))
    .get()
  )

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users().map(user => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  )
}
```
