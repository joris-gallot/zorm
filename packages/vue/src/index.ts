import { defineDatabase } from '@zorm-ts/core'
import { VueDatabase } from './database'

export * from './database'

export function useReactiveDatabase(): void {
  defineDatabase(new VueDatabase())
}
