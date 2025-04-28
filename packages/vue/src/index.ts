import type { VueDatabaseOptions } from './database'
import { defineDatabase } from '@zorm-ts/core'
import { VueDatabase } from './database'

export * from './database'

export function useReactiveDatabase(options?: VueDatabaseOptions): void {
  defineDatabase(new VueDatabase(options))
}
