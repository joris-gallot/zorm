# @zorm-ts/vue

Vue integration for zorm, providing reactivity support.

## Installation

```bash
npm install @zorm-ts/vue
```

## Usage

To use zorm with Vue, you need to define a reactive database, this will ensure that your components react to changes in your zorm queries. Call `useReactiveDatabase()` once at the highest level of your application (typically in your main.ts/js file) to properly initialize the reactivity system.

```typescript
import { useReactiveDatabase } from '@zorm-ts/vue'

// Initialize the Vue reactive database
useReactiveDatabase()

// Use in your Vue components
const users = computed(() => userQuery.query().get()) // Will be reactive!
```

## License

MIT
