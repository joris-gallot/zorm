import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import type { Ref } from 'vue'
import { LOCAL_STORAGE_KEY } from '@zorm-ts/core'
import { ref, watch } from 'vue'

export interface VueDatabaseOptions {
  localStorage?: boolean
}

export class VueDatabase implements ZormDatabase {
  private db: Ref<Record<string, Record<string, ObjectWithId>>> = ref({})
  private isLocalStorage: boolean

  constructor({ localStorage: isLocalStorage = false }: VueDatabaseOptions = {}) {
    this.isLocalStorage = isLocalStorage

    if (isLocalStorage) {
      if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
        this.db.value = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      }

      watch(this.db, (db) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db))
      }, { deep: true })
    }
  }

  public registerEntity(name: string): void {
    if (this.db.value[name]) {
      return
    }

    this.db.value[name] = {}
  }

  public getAll(entity: string): ObjectWithId[] {
    // entity is guaranteed to exist when getAll is called
    const values = this.db.value[entity]!

    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return this.db.value[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.db.value[entity]![value.id] = value
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.db.value[entity]![id]![key] = value as ObjectWithId[keyof ObjectWithId]
  }

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    if (this.isLocalStorage && localStorage.getItem(LOCAL_STORAGE_KEY)) {
      return
    }

    this.db.value = db
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    return this.db.value
  }
}
