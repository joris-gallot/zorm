import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['packages/**/*.ts'],
    },
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.json',
    },
  },
})
