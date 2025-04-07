import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['packages/**/*.ts'],
    },
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.json',
    },
  },
})
