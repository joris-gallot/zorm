import type { ObjectWithId } from '../orm'

export interface ZormDatabase {
  registerEntity: (name: string) => void
  getAll: (entity: string) => ObjectWithId[]
  getEntity: (entity: string, id: ObjectWithId['id']) => ObjectWithId | null
  setEntity: (entity: string, value: ObjectWithId) => void
  setEntityKey: (entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown) => void
  setData: (db: Record<string, Record<string, ObjectWithId>>) => void
  getData: () => Record<string, Record<string, ObjectWithId>>
}

export class DefaultDatabase implements ZormDatabase {
  #db: Record<string, Record<string, ObjectWithId>> = {}

  public registerEntity(name: string): void {
    this.#db[name] = {}
  }

  public getAll(entity: string): ObjectWithId[] {
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

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    this.#db = db
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    return this.#db
  }

  public reset(): void {
    this.#db = {}
  }
}
