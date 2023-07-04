/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:type-graphql/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'type-graphql'],
  rules: {},
  overrides: [
    {
      files: ['**/*.graphql'],
      parser: '@graphql-eslint/eslint-plugin',
      extends: 'plugin:@graphql-eslint/schema-recommended',
      rules: {
        '@graphql-eslint/require-description': 'off',
        '@graphql-eslint/strict-id-in-types': 'off',
        '@graphql-eslint/naming-convention': 'off',
        '@graphql-eslint/no-hashtag-description': 'off',
        '@graphql-eslint/no-unreachable-types': 'off',
        '@graphql-eslint/description-style': 'off',
        '@graphql-eslint/no-typename-prefix': 'off',
      },
    },
  ],
};
