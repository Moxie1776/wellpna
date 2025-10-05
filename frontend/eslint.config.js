import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import path from 'path'
import { fileURLToPath } from 'url'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default defineConfig([
  {
    ignores: [
      '**/node_modules/*',
      '**/out/*',
      '**/src/assets/*',
      '**/dist/*',
      '**/logs/*',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ),
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      react,
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
      'react-hooks': reactHooks, // Add react-hooks plugin
    },
    rules: {
      'linebreak-style': ['warn', 'unix'],
      'max-len': ['warn', { code: 80 }],
      'no-empty-pattern': 'off',
      'no-extra-boolean-cast': 'off',
      'no-unused-vars': 'off',
      quotes: ['warn', 'single'],
      'react/no-children-prop': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error', // Enforce React hooks rules
      'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies
      semi: 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/__tests__/**/*.{js,ts,tsx}'],
    rules: {
      'max-len': 'off',
    },
  },
])
