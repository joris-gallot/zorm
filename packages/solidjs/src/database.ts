import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import type { SetStoreFunction } from 'solid-js/store'
import { createStore } from 'solid-js/store'

/* v8 ignore next: find why the next line is partially uncovered */
export class SolidjsDatabase implements ZormDatabase {
  #store: [Record<string, Record<string, ObjectWithId>>, SetStoreFunction<Record<string, Record<string, ObjectWithId>>>]
  #setDb: SetStoreFunction<Record<string, Record<string, ObjectWithId>>>

  constructor() {
    this.#store = createStore<Record<string, Record<string, ObjectWithId>>>({})
    this.#setDb = this.#store[1]
  }

  #db(): Record<string, Record<string, ObjectWithId>> {
    return this.#store[0]
  }

  public registerEntity(name: string): void {
    this.#setDb(name, {})
  }

  public getAll(entity: string): ObjectWithId[] {
    // entity is guaranteed to exist when getAll is called
    const values = this.#db()[entity]!
    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return this.#db()[entity]?.[id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.#setDb(entity, String(value.id), value)
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.#setDb(entity, String(id), key, value as ObjectWithId[keyof ObjectWithId])
  }

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    this.#setDb(db)
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    return this.#db()
  }
}
