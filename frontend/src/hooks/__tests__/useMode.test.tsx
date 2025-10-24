import { beforeEach, describe, expect, it, vi } from 'vitest'

// Create mocks inside the factory so they are initialized when the mock is hoisted
vi.mock('../../store/theme', () => {
  const useModeStore = vi.fn()
  return { useModeStore }
})

vi.mock('@mui/material/styles', () => {
  const useColorScheme = vi.fn()
  return { useColorScheme }
})

import { useColorScheme as mockUseColorScheme } from '@mui/material/styles'
import { renderHook } from '@testing-library/react'

import { useModeStore as mockUseModeStore } from '../../store/theme'
import { useMode } from '../useMode'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useMode', () => {
  let mockSetMode: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSetMode = vi.fn()
    ;(mockUseColorScheme as any).mockReturnValue({
      mode: 'light',
      setMode: vi.fn(),
    })

    // Mock Zustand store
    ;(mockUseModeStore as any).mockImplementation(
      (selector?: (state: any) => any) => {
        const state = {
          mode: 'light',
          setMode: mockSetMode,
        }
        return selector ? selector(state) : state
      },
    )

    // Setup localStorage mocks
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
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
      ;(mockUseModeStore as any).mockImplementation(
        (selector?: (state: any) => any) => {
          const state = {
            mode: 'dark',
            setMode: mockSetMode,
          }
          return selector ? selector(state) : state
        },
      )

      const { result } = renderHook(() => useMode())

      expect(result.current.mode).toBe('dark')
    })

    it('returns system mode when store has system mode', () => {
      ;(mockUseModeStore as any).mockImplementation(
        (selector?: (state: any) => any) => {
          const state = {
            mode: 'system',
            setMode: mockSetMode,
          }
          return selector ? selector(state) : state
        },
      )

      const { result } = renderHook(() => useMode())

      expect(result.current.mode).toBe('system')
    })
  })
})
