import { defineReactivityAdapter } from '@zorm-ts/core'
import { shallowRef, triggerRef } from 'vue'

export function useReactivityAdapter(): void {
  return defineReactivityAdapter(
    () => {
      const state = shallowRef(0)

      return {
        depend: (): void => {
          // eslint-disable-next-line ts/no-unused-expressions
          state.value
        },
        trigger: (): void => {
          triggerRef(state)
        },
      }
    },
  )
}
