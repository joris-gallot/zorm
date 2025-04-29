import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    pnpm: true,
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'test/no-only-tests': 'error',
      'test/no-disabled-tests': 'error',
    },
  },
  {
    ignores: [
      '**/tests/**',
      'playground/**',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
  {
    files: ['**/*.md/*.ts'],
    rules: {
      'prefer-const': 'off',
    },
  },
)
