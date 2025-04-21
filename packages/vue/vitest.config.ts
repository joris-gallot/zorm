import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['**/*.browser.test.ts'],
    name: 'browser',
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
