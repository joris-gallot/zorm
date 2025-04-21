import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: [
      'packages/*',
      'packages/**/vitest.config.ts',
    ],
    coverage: {
      enabled: true,
      include: ['packages/**/*.ts'],
      thresholds: {
        100: true,
      },
    },
  },
})
