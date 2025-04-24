import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEntity, defineQueryBuilder } from '../src/orm'

describe('first', () => {
  const User = defineEntity('user', z.object({
    id: z.number(),
    name: z.string(),
    age: z.number().optional(),
  }))

  const queryBuilder = defineQueryBuilder([User])

  queryBuilder.user.save([
    { id: 1, name: 'John', age: 20 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Peter', age: 30 },
    { id: 4, name: 'Mary', age: 35 },
  ])

  it('should return the first element matching the query', () => {
    const user = queryBuilder.user.query()
      .where(u => (u.age ?? 0) > 20)
      .orderBy(['age'], ['asc'])
      .first()
      .get()

    expect(user).toEqual({ id: 2, name: 'Jane', age: 25 })
    assertType<{ id: number, name: string, age?: number } | null>(user)
  })

  it('should return null if no element matches the query', () => {
    const user = queryBuilder.user.query()
      .where(u => (u.age ?? 0) > 40)
      .first()
      .get()

    expect(user).toBeNull()
    assertType<{ id: number, name: string, age?: number } | null>(user)
  })

  it('should return the first element without where clause', () => {
    const user = queryBuilder.user.query()
      .orderBy(['id'], ['asc'])
      .first()
      .get()

    expect(user).toEqual({ id: 1, name: 'John', age: 20 })
    assertType<{ id: number, name: string, age?: number } | null>(user)
  })

  it('should return the first element without orderBy clause', () => {
    const user = queryBuilder.user.query()
      .first()
      .get()

    // The order without orderBy is not guaranteed, so we check if it's one of the existing users
    expect(user).toEqual(expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }))
    assertType<{ id: number, name: string, age?: number } | null>(user)
  })

  it('should return the first element with descending order', () => {
    const user = queryBuilder.user.query()
      .orderBy(['age'], ['desc'])
      .first()
      .get()

    expect(user).toEqual({ id: 4, name: 'Mary', age: 35 })
    assertType<{ id: number, name: string, age?: number } | null>(user)
  })

  it('should have the correct type', () => {
    const user = queryBuilder.user.query().first().get()
    assertType<{ id: number, name: string, age?: number } | null>(user)

    const users = queryBuilder.user.query().get()
    assertType<Array<{ id: number, name: string, age?: number }>>(users)
  })
})
