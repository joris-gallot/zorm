import { defineReactivityDatabase } from '@zorm-ts/core'
import { VueDatabase } from './database'

export * from './database'

export function useReactiveDatabase(): void {
  defineReactivityDatabase(new VueDatabase())
}
