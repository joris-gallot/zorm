import { defineReactivityDatabase } from '@zorm-ts/core'
import { SvelteDatabase } from './database.js'

export * from './database.js'

export function useReactiveDatabase(): void {
  defineReactivityDatabase(new SvelteDatabase())
}
