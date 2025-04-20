import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'test/no-only-tests': 'error',
      'test/no-disabled-tests': 'error',
    },
  },
  {
    ignores: [
      '**/*.test.ts',
      'playground/**',
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
)
