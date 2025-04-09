import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    rules: {
      'unused-imports/no-unused-imports': 'error',
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
