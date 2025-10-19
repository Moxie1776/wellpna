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
    // Increase timeouts to accommodate integration tests against a real backend
    // Many flows (sign up, debug verify, sign in) may take longer than the
    // default. Set a generous 60s test and hook timeout for CI/local runs so
    // transient backend slowness doesn't cause spurious failures.
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
