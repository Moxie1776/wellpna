/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'
import { Plugin } from 'vite'

export default defineConfig({
  // Add a tiny Vite plugin to intercept CSS imports from MUI X
  // that sometimes fail import-analysis in the test runner. The
  // plugin provides a virtual module for those CSS files so the
  // node test environment doesn't attempt to load raw .css from
  // node_modules as ESM.
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
            '@mui/x-data-grid',
            '@mui/x-data-grid/esm',
            '@mui/x-data-grid-pro',
            '@mui/x-data-grid-premium',
          ],
        },
      },
    },
    css: false,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    // Use the alias array form so we can match regex patterns reliably
    // during the vitest/node resolution step.
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: /^@fontsource\/roboto\/.*\.css$/,
        replacement: 'identity-obj-proxy',
      },
      {
        // match any import path that contains the package path and ends with .css
        // (eg. absolute paths under node_modules or bare specifiers) and map
        // it directly to our css mock so import-analysis doesn't try to load
        // raw CSS files from node_modules.
        find: /@mui\/x-data-grid\/.*\.css$/,
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      // Also match any resolved absolute path that ends with the package's
      // esm/index.css (this covers cases where Vite resolves the relative
      // import to an absolute node_modules path during import-analysis).
      {
        find: /.*@mui\/x-data-grid\/esm\/index\.css$/,
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      // Explicit specific mapping for the datagrid entrypoint used by the
      // package to avoid unknown .css extension errors during import analysis.
      {
        find: '@mui/x-data-grid/esm/index.css',
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      // Map the resolved node_modules absolute paths for the DataGrid CSS to
      // the css mock as well. When dependencies are inlined, Vite may resolve
      // relative imports to absolute file paths under node_modules which
      // aren't matched by the bare-specifier alias above.
      {
        find: path.resolve(
          __dirname,
          './node_modules/@mui/x-data-grid/esm/index.css',
        ),
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      {
        find: path.resolve(
          __dirname,
          './node_modules/@mui/x-data-grid/index.css',
        ),
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      // Map local global.css imports (relative './global.css' from App.tsx)
      // to the css mock so Vite's import analysis doesn't fail on .css files.
      // Explicit match for the import specifier used in App.tsx: "./global.css".
      // Vite's resolver sees the literal specifier, so match it directly.
      {
        find: './global.css',
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      // Also handle absolute-style imports that might appear in some tooling
      // (e.g. '/src/global.css') by mapping the resolved path as well.
      {
        find: path.resolve(__dirname, './src/global.css'),
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      { find: /^@mui\/material\/.*\.css$/, replacement: 'identity-obj-proxy' },
      // Fallback: map any .css import to a local mock so node test runner
      // doesn't attempt to load CSS files from node_modules as ESM.
      // Fallback: map any .css import to a local mock so the node test runner
      // doesn't attempt to load CSS files as ESM. Use a simple regex that
      // matches imports ending in .css.
      {
        find: /node_modules\/@mui\/x-data-grid\/esm\/index\.css$/,
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
      {
        find: /\.css$/,
        replacement: path.resolve(__dirname, './tests/cssMock.ts'),
      },
    ],
  },
})
