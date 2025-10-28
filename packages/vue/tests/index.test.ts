import { describe, expect, it } from 'vitest'
import * as exports from '../src/index'

const expectedExports = [
  'useReactiveDatabase',
  'default',
  'VueDatabase',
]

describe('index', () => {
  it('should export all expected exports', () => {
    expect(Object.keys(exports)).toEqual(expectedExports)
  })
})
