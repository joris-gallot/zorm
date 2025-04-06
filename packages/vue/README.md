# @zodorm/vue

Vue integration for zodorm, providing reactivity support.

## Installation

```bash
npm install @zodorm/vue
```

## Usage

To use zodorm with Vue, you need to define a reactivity adapter. This will ensure that your Vue components react to changes in your zodorm queries.

```typescript
import { useReactivityAdapter } from '@zodorm/vue'

// Initialize the Vue reactivity adapter
useReactivityAdapter()

// Use in your Vue components
const users = computed(() => userQuery.query().get()) // Will be reactive!
```

## License

MIT
