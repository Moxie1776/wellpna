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
        resolveId(source, _importer) {
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
    (() => {
      return {
        name: 'polyfill-html-form-element',
        transform(code, id) {
          // Apply polyfill at the beginning of test files
          if (id.includes('.test.') || id.includes('/__tests__/')) {
            return `
              // Polyfill HTMLFormElement.requestSubmit
              if (typeof HTMLFormElement !== 'undefined' && !HTMLFormElement.prototype.requestSubmit) {
                HTMLFormElement.prototype.requestSubmit = function(submitter) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                  submitEvent.submitter = submitter;
                  const cancelled = !this.dispatchEvent(submitEvent);
                  if (!cancelled) {
                    this.submit();
                  }
                };
              }
              ${code}
            `
          }
          return code
        },
      } as Plugin
    })(),
  ],
  test: {
    environment: 'jsdom',
    globalSetup: './tests/global-setup.ts',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
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
  server: {
    allowedHosts: ['wellpna.com', 'www.wellpna.com', 'localhost'],
  },
})
