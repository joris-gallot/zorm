import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import type { Ref } from 'vue'
import { defineReactivityDatabase } from '@zorm-ts/core'
import { ref } from 'vue'

export class VueDatabase implements ZormDatabase {
  #db: Ref<Record<string, Record<string, ObjectWithId>>>

  constructor() {
    this.#db = ref({})
  }

  public registerEntity(name: string): void {
    this.#db.value[name] = {}
  }

  public getAll(entity: string): ObjectWithId[] {
    // entity is guaranteed to exist when getAll is called
    const values = this.#db.value[entity]!

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

export function useReactiveDatabase(): void {
  defineReactivityDatabase(new VueDatabase())
}
