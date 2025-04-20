import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import { defineReactivityDatabase } from '@zorm-ts/core'
import { createSubscriber } from 'svelte/reactivity'

export class SvelteDatabase implements ZormDatabase {
  #db: Record<string, Record<string, ObjectWithId>> = {}
  #update: () => void = () => {}
  #subscribe: () => void

  constructor() {
    this.#subscribe = createSubscriber((updateFn) => {
      this.#update = updateFn
    })
  }

  public registerEntity(name: string): void {
    this.#db[name] = {}
    this.#update()
  }

  public getAll(entity: string): ObjectWithId[] {
    this.#subscribe()
    const values = this.#db[entity]!
    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    this.#subscribe()
    return this.#db[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.#db[entity]![value.id] = value
    this.#update()
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.#db[entity]![id]![key] = value as ObjectWithId[keyof ObjectWithId]
    this.#update()
  }

  public initFrom(db: Record<string, Record<string, ObjectWithId>>): void {
    this.#db = db
    this.#update()
  }

  public getDb(): Record<string, Record<string, ObjectWithId>> {
    this.#subscribe()
    return this.#db
  }
}

export function useReactiveDatabase(): void {
  defineReactivityDatabase(new SvelteDatabase())
}
