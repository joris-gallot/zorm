import type { App } from 'vue'
import type { VueDatabaseOptions } from './database'

import { defineDatabase, getDb } from '@zorm-ts/core'
import { VueDatabase } from './database'
import { setupZormDevtools } from './devtools'

export * from './database'

export function useReactiveDatabase(options?: VueDatabaseOptions): void {
  defineDatabase(new VueDatabase(options))
}

export default {
  install(app: App, options?: VueDatabaseOptions): void {
    useReactiveDatabase(options)

    if (process.env.NODE_ENV === 'development' || __VUE_PROD_DEVTOOLS__) {
      const database = getDb()

      if (database) {
        setupZormDevtools(app, database)
      }
      else {
        console.warn('[Zorm DevTools] No database instance found. Make sure to initialize entities before installing the devtools plugin.')
      }
    }
  },
}
