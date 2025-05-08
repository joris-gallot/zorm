import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import type { SetStoreFunction } from 'solid-js/store'
import { LOCAL_STORAGE_KEY } from '@zorm-ts/core'
import { createStore } from 'solid-js/store'

export interface SolidjsDatabaseOptions {
  localStorage?: boolean
}

/* v8 ignore next: find why the next line is partially uncovered */
export class SolidjsDatabase implements ZormDatabase {
  #store: [Record<string, Record<string, ObjectWithId>>, SetStoreFunction<Record<string, Record<string, ObjectWithId>>>]
  #setDb: SetStoreFunction<Record<string, Record<string, ObjectWithId>>>
  #isLocalStorage: boolean

  constructor({ localStorage: isLocalStorage = false }: SolidjsDatabaseOptions = {}) {
    this.#store = createStore<Record<string, Record<string, ObjectWithId>>>({})
    this.#setDb = this.#store[1]
    this.#isLocalStorage = isLocalStorage

    if (isLocalStorage && localStorage.getItem(LOCAL_STORAGE_KEY)) {
      this.setDb(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!))
    }
  }

  get #db(): Record<string, Record<string, ObjectWithId>> {
    return this.#store[0]
  }

  private setDb(...params: any[]): void {
    // @ts-expect-error - did not find a way to type this correctly
    this.#setDb(...params)
    if (this.#isLocalStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#db))
    }
  }

  public registerEntity(name: string): void {
    if (this.#db[name]) {
      return
    }

    this.#setDb(name, {})
  }

  public getAll(entity: string): ObjectWithId[] {
    const values = this.#db[entity]!
    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return this.#db[entity]?.[id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.setDb(entity, String(value.id), value)
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.setDb(entity, String(id), key, value as ObjectWithId[keyof ObjectWithId])
  }

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    if (this.#isLocalStorage && localStorage.getItem(LOCAL_STORAGE_KEY)) {
      return
    }

    this.setDb(db)
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    return this.#db
  }
}
