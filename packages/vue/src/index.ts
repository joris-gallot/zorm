import type { Database, ObjectWithId } from '@zorm-ts/core'
import type { Ref } from 'vue'
import { defineReactivityDatabase } from '@zorm-ts/core'
import { ref } from 'vue'

class VueDatabase implements Database {
  #db: Ref<Record<string, Record<string, ObjectWithId>>>

  constructor() {
    this.#db = ref({})
  }

  public registerEntity(name: string): void {
    this.#db.value[name] = {}
  }

  public getAll(entity: string): ObjectWithId[] {
    const values = this.#db.value[entity]

    if (!values) {
      throw new Error(`Entity ${entity} not found`)
    }

    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return this.#db.value[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.#db.value[entity]![value.id] = value
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.#db.value[entity]![id]![key] = value as ObjectWithId[keyof ObjectWithId]
  }
}

export function useReactivityAdapter(): void {
  defineReactivityDatabase(new VueDatabase())
  // return defineReactivityAdapter(
  //   () => {
  //     const state = shallowRef(0)

  //     return {
  //       depend: (): void => {
  //         // eslint-disable-next-line ts/no-unused-expressions
  //         state.value
  //       },
  //       trigger: (): void => {
  //         triggerRef(state)
  //       },
  //     }
  //   },
  // )
}
