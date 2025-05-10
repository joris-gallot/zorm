import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import { LOCAL_STORAGE_KEY } from '@zorm-ts/core'

import { createSubscriber } from 'svelte/reactivity'

export interface SvelteDatabaseOptions {
  localStorage?: boolean
}

/* v8 ignore next: find why the next line is partially uncovered */
export class SvelteDatabase implements ZormDatabase {
  private db: Record<string, Record<string, ObjectWithId>> = {}
  private updateDb: () => void = () => {}
  private subscribe: () => void
  private isLocalStorage: boolean

  constructor({ localStorage: isLocalStorage = false }: SvelteDatabaseOptions = {}) {
    this.subscribe = createSubscriber((updateFn) => {
      this.updateDb = updateFn
    })

    this.isLocalStorage = isLocalStorage

    if (isLocalStorage && localStorage.getItem(LOCAL_STORAGE_KEY)) {
      this.db = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      this.updateDb()
    }
  }

  private update(): void {
    this.updateDb()

    if (this.isLocalStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.db))
    }
  }

  public registerEntity(name: string): void {
    if (this.db[name]) {
      return
    }

    this.db[name] = {}
    this.update()
  }

  public getAll(entity: string): ObjectWithId[] {
    this.subscribe()
    const values = this.db[entity]!
    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    this.subscribe()
    return this.db[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.db[entity]![value.id] = value
    this.update()
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.db[entity]![id]![key] = value as ObjectWithId[keyof ObjectWithId]
    this.update()
  }

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    if (this.isLocalStorage && localStorage.getItem(LOCAL_STORAGE_KEY)) {
      return
    }

    this.db = db
    this.update()
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    this.subscribe()
    return this.db
  }
}
