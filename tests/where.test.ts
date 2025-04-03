import { defineEntity, defineQueryBuilder } from '@/orm'
import { assertType, describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('where', () => {
  it('should valid types', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      isAdmin: z.boolean().optional(),
    }))

    const userQuery = defineQueryBuilder(User)

    const _users = userQuery.query()
      .where('name', '=', 'John')
      .where('id', '>', 10)
      .where('isAdmin', '=', true)
      .where('isAdmin', '!=', undefined)
      // @ts-expect-error invalid operator
      .where('isAdmin', 'is', true)
      // @ts-expect-error invalid operator
      .where('isAdmin', '', true)
      // @ts-expect-error invalid field
      .where('foo', '=', 'bar')
      // @ts-expect-error invalid field
      .where('', '=', 'bar')
      // @ts-expect-error invalid value
      .where('isAdmin', '!=', null)
      // @ts-expect-error invalid value
      .where('isAdmin', '=', 'true')
      // @ts-expect-error invalid value
      .where('name', '=', 1)
      // @ts-expect-error invalid value
      .where('id', '=', true)
      .get()

    assertType<typeof _users>([{
      id: 1,
      name: 'John Doe',
      isAdmin: true,
    }])
  })

  it('should filter by field', () => {
    const User = defineEntity('user', z.object({
      id: z.number(),
      name: z.string(),
      isAdmin: z.boolean().optional(),
    }))

    const userQuery = defineQueryBuilder(User)

    userQuery.save([{
      id: 1,
      name: 'John Doe',
      isAdmin: true,
    }, {
      id: 2,
      name: 'Simon Eder',
      isAdmin: false,
    }, {
      id: 3,
      name: 'Max Mustermann',
      isAdmin: false,
    }])

    const users = userQuery.query()
      .where('name', '=', 'John Doe')
      .get()

    const expectedUsers = [{
      id: 1,
      name: 'John Doe',
      isAdmin: true,
    }]
    assertType<typeof users>(expectedUsers)
    expect(users).toEqual(expectedUsers)

    const users2 = userQuery.query()
      .where('id', '>', 1)
      .get()

    const expectedUsers2 = [{
      id: 2,
      name: 'Simon Eder',
      isAdmin: false,
    }, {
      id: 3,
      name: 'Max Mustermann',
      isAdmin: false,
    }]
    assertType<typeof users2>(expectedUsers2)
    expect(users2).toEqual(expectedUsers2)

    const users3 = userQuery.query()
      .where('id', '>', 1)
      .where('id', '<', 3)
      .get()

    const expectedUsers3 = [{
      id: 2,
      name: 'Simon Eder',
      isAdmin: false,
    }]
    assertType<typeof users3>(expectedUsers3)
    expect(users3).toEqual(expectedUsers3)

    const users4 = userQuery.query()
      .where('isAdmin', '=', false)
      .where('id', '<', 3)
      .where('name', '=', 'Simon Eder')
      .get()

    const expectedUsers4 = [{
      id: 2,
      name: 'Simon Eder',
      isAdmin: false,
    }]
    assertType<typeof users4>(expectedUsers4)
    expect(users4).toEqual(expectedUsers4)

    const users5 = userQuery.query()
      .where('isAdmin', '=', false)
      .where('id', '<=', 3)
      .get()

    const expectedUsers5 = [{
      id: 2,
      name: 'Simon Eder',
      isAdmin: false,
    }, {
      id: 3,
      name: 'Max Mustermann',
      isAdmin: false,
    }]
    assertType<typeof users5>(expectedUsers5)
    expect(users5).toEqual(expectedUsers5)
  })
})
