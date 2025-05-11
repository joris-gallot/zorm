---
outline: deep
---

# Svelte Integration

## Installation

```bash
npm install @zorm-ts/svelte
```

## Usage

Initialize the Svelte reactive database as early as possible in your application, ideally before any entity definitions. The main application file is a good place for this:

```typescript
import { useReactivityAdapter } from '@zorm-ts/svelte'

// Initialize the Svelte reactivity adapter
useReactivityAdapter()

// Use in your Svelte components
let users = $state(() => userQuery.query().get()) // Will be reactive!
```

## Example Component

Here's a complete example of using zorm in a Svelte component:

```svelte
<script lang="ts">
  import { userQuery } from './your-query-builder'

  // Reactive query that will update when data changes
  let users = $state(() => userQuery.query()
    .where(user => user.email.endsWith('@example.com'))
    .get()
  )
</script>

<div>
  <h1>Users</h1>
  <ul>
    {#each users() as user (user.id)}
      <li>{user.email}</li>
    {/each}
  </ul>
</div>
```
