import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['packages/**/*.ts'],
      thresholds: {
        100: true,
      },
    },
  },
})
