// Polyfill for document.elementFromPoint for JSDOM
if (typeof document !== 'undefined' && !document.elementFromPoint) {
  document.elementFromPoint = function (x, y) {
    // Simple polyfill: always return the body
    return document.body;
  };
}
import '@testing-library/jest-dom';
declare var global: typeof globalThis;

// Minimal TextEncoder/TextDecoder polyfill for Jest
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encoding = 'utf-8';
    encode(str: string) {
      const utf8 = unescape(encodeURIComponent(str));
      const arr = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) arr[i] = utf8.charCodeAt(i);
      return arr;
    }
    encodeInto(str: string, arr: Uint8Array) {
      const encoded = this.encode(str);
      arr.set(encoded);
      return { read: str.length, written: encoded.length };
    }
  };
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class {
    encoding = 'utf-8';
    fatal = false;
    ignoreBOM = false;
    decode(arr: Uint8Array) {
      const utf8 = String.fromCharCode(...arr);
      return decodeURIComponent(escape(utf8));
    }
  };
}

// Polyfill ResizeObserver for shadcn/ui InputOTP tests
global.ResizeObserver =
  global.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
