// Mock import.meta for ES module compatibility
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_GRAPHQL_ENDPOINT: 'http://localhost:4000/graphql',
        // Add other env vars as needed
      },
    },
  },
  writable: false,
})
// Mock window.matchMedia for Joy UI/MUI tests
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  document.elementFromPoint = function (_x, _y) {
    // Simple polyfill: always return the body
    return document.body
  }
}
import '@testing-library/jest-dom'
import { act } from '@testing-library/react'
declare global {
  // eslint-disable-next-line no-var
  var act: (typeof import('@testing-library/react'))['act']
}
globalThis.act = act
declare let global: typeof globalThis

// Minimal TextEncoder/TextDecoder polyfill for Jest
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
}
