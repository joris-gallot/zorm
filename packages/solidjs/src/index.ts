import type { SolidjsDatabaseOptions } from './database'
import { defineDatabase } from '@zorm-ts/core'
import { SolidjsDatabase } from './database'

export * from './database'

export function useReactiveDatabase(options?: SolidjsDatabaseOptions): void {
  defineDatabase(new SolidjsDatabase(options))
}
