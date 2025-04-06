import { defineReactivityAdapter } from '@zodorm/core'
import { shallowRef, triggerRef } from 'vue'

export function defineVueReactivityAdapter() {
  return defineReactivityAdapter(
    () => {
      const state = shallowRef(0)

      return {
        depend: () => {
          // eslint-disable-next-line ts/no-unused-expressions
          state.value
        },
        trigger: () => {
          triggerRef(state)
        },
      }
    },
  )
}
