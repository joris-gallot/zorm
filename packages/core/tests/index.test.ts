import { describe, expect, it } from 'vitest'
import * as exports from '../src/index'

const expectedExports = [
  'LOCAL_STORAGE_KEY',
  'DefaultDatabase',
  'getDb',
  'defineDatabase',
  'defineEntity',
  'defineQueryBuilder',
]

describe('index', () => {
  it('should export all expected exports', () => {
    expect(Object.keys(exports)).toEqual(expectedExports)
  })
})
