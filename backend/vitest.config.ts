import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    root: '.',
    include: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 10000,
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 1,
        minThreads: 1,
      },
    },
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/generated/**'],
    },
  },
  esbuild: {
    target: 'node18',
  },
})
