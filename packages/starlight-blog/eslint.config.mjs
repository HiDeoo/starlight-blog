import hideoo from '@hideoo/eslint-config'

export default hideoo(
  {
    ignores: ['eslint.config.mjs'],
    languageOptions: {
      parserOptions: {
        project: ['../../tsconfig.json'],
      },
    },
  },
  {
    files: ['**/*.d.ts', 'src/global.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
)
