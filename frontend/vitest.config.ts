/// <reference types="vitest" />
import path from 'path'
import { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    (() => {
      const idMarker = '\0__css-mock'
      return {
        name: 'mock-css',
        resolveId(source, importer) {
          if (typeof source === 'string' && source.endsWith('.css')) {
            return idMarker
          }
          return null
        },
        load(id) {
          if (id === idMarker) {
            return 'export default {}'
          }
          return null
        },
      } as Plugin
    })(),
  ],
  test: {
    environment: 'jsdom',
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    deps: {
      optimizer: {
        web: {
          include: [
            // Removed @mui/x-data-grid from optimizer to prevent CSS import issues during tests
            // '@mui/x-data-grid',
            // '@mui/x-data-grid/esm',
            // '@mui/x-data-grid-pro',
            // '@mui/x-data-grid-premium',
          ],
        },
      },
    },
    css: false,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: /^@fontsource\/roboto\/.*\.css$/,
        replacement: 'identity-obj-proxy',
      },
      {
        find: './global.css',
        replacement: 'identity-obj-proxy',
      },
      {
        find: /\.css$/,
        replacement: 'identity-obj-proxy',
      },
    ],
  },
})
