# @zorm-ts/vue

Vue integration for zorm, providing reactivity support.

## Installation

```bash
npm install @zorm-ts/vue
```

## Usage

```typescript
import zorm from '@zorm-ts/vue'

app.use(zorm)

// Use in your Vue components
const users = computed(() => userQuery.query().get()) // Will be reactive!
```

## License

MIT
