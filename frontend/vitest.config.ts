/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fontsource/roboto/.*\\.css$': 'identity-obj-proxy',
    },
  },
})
