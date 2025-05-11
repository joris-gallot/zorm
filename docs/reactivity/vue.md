---
outline: deep
---

# Vue Integration

## Installation

```bash
npm install @zorm-ts/vue
```

## Usage

Initialize the Vue reactive database as early as possible in your application, ideally before any entity definitions. The main application file is a good place for this:

```typescript
import { useReactiveDatabase } from '@zorm-ts/vue'

// Initialize the Vue reactive database
useReactiveDatabase()

// Use in your Vue components
const users = computed(() => userQuery.query().get()) // Will be reactive!
```

## Example Component

Here's a complete example of using zorm in a Vue component:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { userQuery } from './your-query-builder'

// Reactive query that will update when data changes
const users = computed(() => userQuery.query()
  .where(user => user.email.endsWith('@example.com'))
  .get()
)
</script>

<template>
  <div>
    <h1>Users</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.email }}
      </li>
    </ul>
  </div>
</template>
```
