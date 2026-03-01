// eslint.config.js (CommonJS)

const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const tseslint = require('typescript-eslint');

module.exports = [
  /* -------------------- IGNORES -------------------- */
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },

  /* -------------------- BASE -------------------- */
  js.configs.recommended,
  ...tseslint.configs.recommended,

  /* -------------------- COMMONJS (JS + TS) -------------------- */
  {
    files: ['**/*.js', '**/*.cjs', '**/*.ts'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },

  /* -------------------- PRETTIER -------------------- */
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  prettier,
];
