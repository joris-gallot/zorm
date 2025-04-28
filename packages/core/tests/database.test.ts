import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineDatabase, defineEntity, defineQueryBuilder } from '../src'
import { LocalStorageDatabase } from '../src/databases/localstorage'

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
