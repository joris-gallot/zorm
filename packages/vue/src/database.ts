import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import type { Ref, WritableComputedRef } from 'vue'
import { LOCAL_STORAGE_KEY } from '@zorm-ts/core'

import { computed, ref } from 'vue'

export interface VueDatabaseOptions {
  localStorage?: boolean
}

/* v8 ignore next: find why the next line is partially uncovered */
export class VueDatabase implements ZormDatabase {
  #_db: Ref<Record<string, Record<string, ObjectWithId>>> = ref({})
  #isLocalStorage: boolean

  #db: WritableComputedRef<Record<string, Record<string, ObjectWithId>>> = computed({
    set: (value) => {
      if (this.#isLocalStorage) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value))
      }
      this.#_db.value = value
    },
    get: () => {
      if (this.#isLocalStorage) {
        this.#_db.value = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      }

      return this.#_db.value
    },
  })

  constructor({ localStorage = false }: VueDatabaseOptions = {}) {
    this.#isLocalStorage = localStorage
  }

  public registerEntity(name: string): void {
    this.#db.value = { ...this.#db.value, [name]: {} }
  }

  public getAll(entity: string): ObjectWithId[] {
    const values = this.#db.value[entity]!

    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return this.#db.value[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.#db.value = {
      ...this.#db.value,
      [entity]: {
        ...this.#db.value[entity],
        [value.id]: value,
      },
    }
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.#db.value = {
      ...this.#db.value,
      [entity]: {
        ...this.#db.value[entity],
        [id]: {
          ...this.#db.value[entity]![id],
          [key]: value as ObjectWithId[keyof ObjectWithId],
        },
      },
    }
  }

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    this.#db.value = db
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    return this.#db.value
  }
}
