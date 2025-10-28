import type { App, Plugin } from 'vue'
import type { VueDatabaseOptions } from './database'

import { defineDatabase } from '@zorm-ts/core'
import { VueDatabase } from './database'
import { setupZormDevtools } from './devtools'

export * from './database'

export function useReactiveDatabase(options?: VueDatabaseOptions): void {
  defineDatabase(new VueDatabase(options))
}

export default <Plugin>{
  // istanbul ignore next
  install(app: App, options?: VueDatabaseOptions): void {
    useReactiveDatabase(options)

    setupZormDevtools(app)
  },
}
