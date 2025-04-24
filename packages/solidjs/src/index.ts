import { defineReactivityDatabase } from '@zorm-ts/core'
import { SolidjsDatabase } from './database'

export * from './database'

export function useReactiveDatabase(): void {
  defineReactivityDatabase(new SolidjsDatabase())
}
