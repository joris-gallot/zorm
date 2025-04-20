import type { ObjectWithId } from './orm'

export interface ZormDatabase {
  registerEntity: (name: string) => void
  getAll: (entity: string) => ObjectWithId[]
  getEntity: (entity: string, id: ObjectWithId['id']) => ObjectWithId | null
  setEntity: (entity: string, value: ObjectWithId) => void
  setEntityKey: (entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown) => void
}

export class DefaultDatabase implements ZormDatabase {
  #db: Record<string, Record<string, ObjectWithId>>

  constructor() {
    this.#db = {}
  }

  public registerEntity(name: string): void {
    this.#db[name] = {}
  }

  public getAll(entity: string): ObjectWithId[] {
    // entity is guaranteed to exist when getAll is called
    const values = this.#db[entity]!

    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return this.#db[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    this.#db[entity]![value.id] = value
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    this.#db[entity]![id]![key] = value as ObjectWithId[keyof ObjectWithId]
  }

  public reset(): void {
    this.#db = {}
  }

  public getDb(): Record<string, Record<string, ObjectWithId>> {
    return this.#db
  }
}
