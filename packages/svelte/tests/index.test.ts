import { describe, expect, it } from 'vitest'
import * as exports from '../src/index'

const expectedExports = [
  'SvelteDatabase',
  'useReactiveDatabase',
]

describe('index', () => {
  it('should export all expected exports', () => {
    expect(Object.keys(exports)).toEqual(expectedExports)
  })
})
