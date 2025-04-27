import { describe, expect, it } from 'vitest'
import { DefaultDatabase, defineDatabase, getDb } from '../src'

describe('defineDatabase', () => {
  it('should be instance of DefaultDatabase', () => {
    defineDatabase(new DefaultDatabase())
    expect(getDb()).toBeInstanceOf(DefaultDatabase)
  })
})
