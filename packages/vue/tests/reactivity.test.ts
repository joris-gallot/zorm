import { defineEntity, defineQueryBuilder } from '@zodorm/core'
import { describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { z } from 'zod'
import { useReactivityAdapter } from '../src/index'

describe('reactivity', () => {
  it('findById should not react to changes', () => {
    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const userQuery = defineQueryBuilder(User)

    userQuery.save([{ id: 1, name: 'John' }])

    const user = computed(() => userQuery.findById(1))

    expect(user.value).toEqual({ id: 1, name: 'John' })

    userQuery.save([{ id: 1, name: 'Jane' }])

    expect(user.value).toEqual({ id: 1, name: 'John' })
  })

  it('findById should react to changes', () => {
    useReactivityAdapter()

    const User = defineEntity('user', z.object({ id: z.number(), name: z.string() }))

    const userQuery = defineQueryBuilder(User)

    userQuery.save([{ id: 1, name: 'John' }])

    const user = computed(() => userQuery.findById(1))

    expect(user.value).toEqual({ id: 1, name: 'John' })

    userQuery.save([{ id: 1, name: 'Jane' }])

    expect(user.value).toEqual({ id: 1, name: 'Jane' })
  })

  it('where should react to changes', () => {
    useReactivityAdapter()

    const User = defineEntity('user', z.object({ id: z.number(), age: z.number() }))

    const userQuery = defineQueryBuilder(User)

    userQuery.save([{ id: 1, age: 10 }, { id: 2, age: 20 }, { id: 3, age: 30 }])

    const user = computed(() => userQuery.query().where('age', '>', 10).get())

    expect(user.value).toEqual([{ id: 2, age: 20 }, { id: 3, age: 30 }])

    userQuery.save([{ id: 1, age: 11 }])

    expect(user.value).toEqual([{ id: 1, age: 11 }, { id: 2, age: 20 }, { id: 3, age: 30 }])
  })
})
