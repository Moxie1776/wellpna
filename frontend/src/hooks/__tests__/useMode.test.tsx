import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useModeStore } from '../../store/theme'
import { useMode } from '../useMode'

// Real localStorage functions for integrated testing
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock implementations for integrated testing

describe('useMode', () => {
  beforeEach(() => {
    // Reset state
    useModeStore.setState({ mode: 'light' })
  })

  describe('Initial State Tests', () => {
    it('returns correct initial mode (light)', () => {
      const { result } = renderHook(() => useMode())

      expect(result.current.mode).toBe('light')
      expect(typeof result.current.setMode).toBe('function')
    })

    it('returns setMode function', () => {
      const { result } = renderHook(() => useMode())

      expect(typeof result.current.setMode).toBe('function')
    })
  })

  describe('Mode Access Tests', () => {
    it('returns dark mode when store has dark mode', () => {
      useModeStore.setState({ mode: 'dark' })

      const { result } = renderHook(() => useMode())

      expect(result.current.mode).toBe('dark')
    })

    it('returns system mode when store has system mode', () => {
      useModeStore.setState({ mode: 'system' })

      const { result } = renderHook(() => useMode())

      expect(result.current.mode).toBe('system')
    })
  })
})
