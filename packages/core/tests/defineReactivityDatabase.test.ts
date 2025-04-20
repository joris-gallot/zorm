import { describe, expect, it } from 'vitest'
import { DefaultDatabase, defineReactivityDatabase, getDb } from '../src'

describe('defineReactivityDatabase', () => {
  it('should be instance of DefaultDatabase', () => {
    defineReactivityDatabase(new DefaultDatabase())
    expect(getDb()).toBeInstanceOf(DefaultDatabase)
  })
})
