import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: [
      {
        test: {
          name: 'core',
          environment: 'node',
          include: ['packages/core/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'vue',
          environment: 'node',
          include: ['packages/vue/**/*.test.ts', '!packages/vue/**/*.browser.test.ts'],
        },
      },
      {
        test: {
          name: 'svelte',
          environment: 'node',
          include: ['packages/svelte/**/*.test.ts', '!packages/svelte/**/*.browser.test.ts'],
        },
      },
      'packages/**/vitest.config.ts',
    ],
    coverage: {
      enabled: true,
      include: ['packages/**/src/**/*.ts'],
      thresholds: {
        100: true,
      },
    },
  },
})
