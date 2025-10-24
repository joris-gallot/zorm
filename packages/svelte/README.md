# @zorm-ts/svelte

Svelte integration for zorm, providing reactivity support.

## Installation

```bash
npm install @zorm-ts/svelte
```

## Usage

To use zorm with Svelte, you need to define a reactive database, this will ensure that your components react to changes in your zorm queries. Call `useReactiveDatabase()` once at the highest level of your application (typically in your main.ts/js file) to properly initialize the reactivity system.

```typescript
import { useReactiveDatabase } from '@zorm-ts/svelte'

// Initialize the Svelte reactivity adapter
useReactiveDatabase()

// Use in your Svelte components
let users = $state(() => userQuery.query().get()) // Will be reactive!
```

## License

MIT
