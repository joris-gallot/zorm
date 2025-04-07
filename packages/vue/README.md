# @zorm-ts/vue

Vue integration for zorm, providing reactivity support.

## Installation

```bash
npm install @zorm-ts/vue
```

## Usage

To use zorm with Vue, you need to define a reactivity adapter, this will ensure that your Vue components react to changes in your zorm queries. Call `useReactivityAdapter()` once at the highest level of your application (typically in your main.ts/js file) to properly initialize the reactivity system.

```typescript
import { useReactivityAdapter } from '@zorm-ts/vue'

// Initialize the Vue reactivity adapter
useReactivityAdapter()

// Use in your Vue components
const users = computed(() => userQuery.query().get()) // Will be reactive!
```

## License

MIT
