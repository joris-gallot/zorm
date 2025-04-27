import { defineDatabase } from '@zorm-ts/core'
import { SolidjsDatabase } from './database'

export * from './database'

export function useReactiveDatabase(): void {
  defineDatabase(new SolidjsDatabase())
}
