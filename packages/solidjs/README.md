# @zorm-ts/solidjs

Solidjs integration for zorm, providing reactivity support.

## Installation

```bash
npm install @zorm-ts/solidjs
```

## Usage

To use zorm with Solidjs, you need to define a reactive database, this will ensure that your components react to changes in your zorm queries. Call `useReactiveDatabase()` once at the highest level of your application (typically in your main.ts/js file) to properly initialize the reactivity system.

```typescript
import { useReactiveDatabase } from '@zorm-ts/solidjs'

// Initialize the Solidjs reactive database
useReactiveDatabase()

// Use in your Solidjs components
const users = createMemo(() => userQuery.query().get()) // Will be reactive!
```

## License

MIT
