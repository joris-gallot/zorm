import type { ObjectWithId, ZormDatabase } from '../src'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineDatabase, defineEntity, defineQueryBuilder } from '../src'

const LOCAL_STORAGE_KEY = 'zorm_database'

export class LocalStorageDatabase implements ZormDatabase {
  public registerEntity(name: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      [name]: {},
    }))
  }

  public getAll(entity: string): ObjectWithId[] {
    const values = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)[entity]

    return Object.values(values)
  }

  public getEntity(entity: string, id: ObjectWithId['id']): ObjectWithId | null {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)[entity]![id] ?? null
  }

  public setEntity(entity: string, value: ObjectWithId): void {
    const db = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)

    db[entity] = {
      ...db[entity],
      [value.id]: value,
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db))
  }

  public setEntityKey(entity: string, id: ObjectWithId['id'], key: keyof ObjectWithId, value: unknown): void {
    const db = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)

    db[entity] = {
      ...db[entity],
      [id]: {
        ...db[entity]![id],
        [key]: value,
      },
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db))
  }

  public setData(db: Record<string, Record<string, ObjectWithId>>): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db))
  }

  public getData(): Record<string, Record<string, ObjectWithId>> {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
  }

  public reset(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }
}

describe('database', () => {
  it('should work with local storage', () => {
    defineDatabase(new LocalStorageDatabase())

    const user = defineEntity('user', z.object({
      id: z.string(),
      name: z.string(),
    }))

    const { user: userQuery } = defineQueryBuilder([user])

    userQuery.save({
      id: '1',
      name: 'John Doe',
    })

    expect(userQuery.findById('1')).toEqual({
      id: '1',
      name: 'John Doe',
    })
  })
})
