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
          include: ['packages/vue/**/*.test.ts'],
          exclude: ['packages/vue/**/*.browser.test.ts', '**/node_modules/**', '**/dist/**'],
        },
      },
      {
        test: {
          name: 'svelte',
          environment: 'node',
          include: ['packages/svelte/**/*.test.ts'],
          exclude: ['packages/svelte/**/*.browser.test.ts', '**/node_modules/**', '**/dist/**'],
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
