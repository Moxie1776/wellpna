import '@testing-library/jest-dom'

import { act } from '@testing-library/react'
import { createServer } from 'net'
import { beforeAll, vi } from 'vitest'

import { logger } from '../src/utils'

// Suppress specific console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  // Suppress the requestSubmit warning from JSDOM
  if (args[0]?.includes?.("HTMLFormElement's requestSubmit() method")) {
    return
  }
  originalWarn.apply(console, args)
}

// Mock CSS imports to prevent Vite from trying to process them
vi.mock('*.css', () => ({}))

// Mock HTMLFormElement.requestSubmit for JSDOM
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function (submitter?: HTMLElement) {
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    ;(submitEvent as any).submitter = submitter
    const cancelled = !this.dispatchEvent(submitEvent)
    if (!cancelled) {
      ;(this as any).submit()
    }
  }
}

// Mock MUI X DataGrid to prevent CSS import issues
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: () => null,
}))

// Mock dynamic imports to prevent CSS loading during tests
;(globalThis as any).import = new Proxy(
  (globalThis as any).import || (() => Promise.resolve({})),
  {
    apply(target: any, thisArg: any, args: any[]) {
      const [moduleId] = args
      if (
        moduleId === '@mui/x-data-grid/index.css' ||
        moduleId === '@mui/x-data-grid/esm/index.css'
      ) {
        return Promise.resolve({})
      }
      return target.apply(thisArg, args)
    },
  },
)

// CSS and font files are handled by Vite in test environment
// @mui/x-data-grid is handled by Vite in test environment
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_GRAPHQL_ENDPOINT: process.env.VITE_GRAPHQL_ENDPOINT,
        // Add other env vars as needed
      },
    },
  },
  writable: false,
})

// Mock window.matchMedia for MUI tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {}, // Deprecated
      removeListener: function () {}, // Deprecated
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false
      },
    }
  }
}

// Polyfill for document.elementFromPoint for JSDOM
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = function (_x, _y) {
    // Simple polyfill: always return the body
    return document.body
  }
}

declare global {
  var act: (typeof import('@testing-library/react'))['act']
}
globalThis.act = act

declare let global: typeof globalThis

// Minimal TextEncoder/TextDecoder polyfill for Vitest
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encoding = 'utf-8'
    encode(str: string) {
      // Simple UTF-8 encoding polyfill
      const arr = []
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        if (code < 0x80) {
          arr.push(code)
        } else if (code < 0x800) {
          arr.push(0xc0 | (code >> 6))
          arr.push(0x80 | (code & 0x3f))
        } else if (code < 0x10000) {
          arr.push(0xe0 | (code >> 12))
          arr.push(0x80 | ((code >> 6) & 0x3f))
          arr.push(0x80 | (code & 0x3f))
        } else {
          arr.push(0xf0 | (code >> 18))
          arr.push(0x80 | ((code >> 12) & 0x3f))
          arr.push(0x80 | ((code >> 6) & 0x3f))
          arr.push(0x80 | (code & 0x3f))
        }
      }
      return new Uint8Array(arr)
    }
    encodeInto(str: string, arr: Uint8Array) {
      const encoded = this.encode(str)
      arr.set(encoded)
      return { read: str.length, written: encoded.length }
    }
  }
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class {
    encoding = 'utf-8'
    fatal = false
    ignoreBOM = false
    decode(arr: Uint8Array) {
      // Simple UTF-8 decoding polyfill
      let str = ''
      let i = 0
      while (i < arr.length) {
        const byte1 = arr[i++]
        if (byte1 < 0x80) {
          str += String.fromCharCode(byte1)
        } else if (byte1 < 0xe0) {
          const byte2 = arr[i++]
          str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f))
        } else if (byte1 < 0xf0) {
          const byte2 = arr[i++]
          const byte3 = arr[i++]
          str += String.fromCharCode(
            ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f),
          )
        } else {
          // surrogate pair
          const byte2 = arr[i++]
          const byte3 = arr[i++]
          const byte4 = arr[i++]
          const codepoint =
            ((byte1 & 0x07) << 18) |
            ((byte2 & 0x3f) << 12) |
            ((byte3 & 0x3f) << 6) |
            (byte4 & 0x3f)
          const cp = codepoint - 0x10000
          str += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff))
        }
      }
      return str
    }
  }
  // Polyfill for Request for react-router
  if (typeof global.Request === 'undefined') {
    ;(global as any).Request = class Request {
      constructor(input: string | URL, init?: RequestInit) {
        ;(this as any).url = typeof input === 'string' ? input : input.href
        ;(this as any).method = init?.method || 'GET'
        ;(this as any).headers = new Headers(init?.headers)
        ;(this as any).body = init?.body
      }
    }
  }

  // Polyfill for HTMLFormElement.requestSubmit for JSDOM
  if (
    typeof HTMLFormElement !== 'undefined' &&
    !HTMLFormElement.prototype.requestSubmit
  ) {
    HTMLFormElement.prototype.requestSubmit = function (
      submitter?: HTMLElement,
    ) {
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      })
      ;(submitEvent as any).submitter = submitter
      const cancelled = !this.dispatchEvent(submitEvent)
      if (!cancelled && !this.hasAttribute('novalidate')) {
        // Basic form validation (simplified)
        const inputs = this.querySelectorAll(
          'input[required], select[required], textarea[required]',
        )
        for (const input of inputs) {
          if (!(input as HTMLInputElement).value) {
            const invalidEvent = new Event('invalid', {
              bubbles: true,
              cancelable: false,
            })
            input.dispatchEvent(invalidEvent)
            return
          }
        }
      }
      if (!cancelled) {
        this.submit()
      }
    }
  }
}

const checkPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const testServer = createServer()
      .once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true) // Port is in use
        } else {
          resolve(false)
        }
      })
      .once('listening', () => {
        testServer.close()
        resolve(false) // Port is free
      })
      .listen(port)
  })
}

export async function ensureBackendRunning() {
  try {
    // Check if port is in use
    const portInUse = await checkPortInUse(4000)
    if (!portInUse) {
      throw new Error(
        'Backend server not running on localhost:4000. ' +
          'Please start the backend server in debug mode first.',
      )
    }

    // fetch may be unavailable in Node.js tests; verify port in-use only
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to verify backend server status')
  }
}

// Set test environment variables
process.env.VITE_GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql'
process.env.NODE_ENV = 'debug'

// Logger debug output is allowed in integrated tests
// Tests that need to suppress debug output can do so individually
beforeAll(async () => {
  // Best-effort check that backend is running in debug mode; do not throw
  // so tests that don't need the backend can still run locally.
  try {
    await ensureBackendRunning()
  } catch (err) {
    logger.warn('ensureBackendRunning failed (continuing):', err)
  }

  // Backend server is started in global-setup.ts (if desired)
  // Here we just set up any frontend-specific test setup
})
