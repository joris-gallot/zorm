import type { SvelteDatabaseOptions } from './database.js'
import { defineDatabase } from '@zorm-ts/core'
import { SvelteDatabase } from './database.js'

export * from './database.js'

export function useReactiveDatabase(options?: SvelteDatabaseOptions): void {
  defineDatabase(new SvelteDatabase(options))
}
