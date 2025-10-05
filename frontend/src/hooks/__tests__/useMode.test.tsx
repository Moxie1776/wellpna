import { act, renderHook } from '@testing-library/react'

// Mock Joy UI useColorScheme
const mockUseColorScheme = jest.fn()
jest.mock('@mui/joy/styles', () => ({
  useColorScheme: mockUseColorScheme,
}))

// Mock the mode store
const mockUseModeStore = jest.fn()
jest.mock('../../store/theme', () => ({
  useModeStore: mockUseModeStore,
}))

import { useMode } from '../useMode'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useMode', () => {
  let mockSetMode: jest.Mock
  let mockJoySetMode: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockSetMode = jest.fn()
    mockJoySetMode = jest.fn()

    // Mock Joy UI useColorScheme
    mockUseColorScheme.mockReturnValue({
      mode: 'light',
      setMode: mockJoySetMode,
    })

    // Mock Zustand store
    mockUseModeStore.mockImplementation((selector) => {
      const state = {
        mode: 'light',
        setMode: mockSetMode,
      }
      return selector ? selector(state) : state
    })

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

    it('returns setMode function from Joy UI', () => {
      const { result } = renderHook(() => useMode())

      expect(result.current.setMode).toBe(mockJoySetMode)
    })
  })

  describe('Mode Switching Tests', () => {
    it('syncs Joy UI dark mode to Zustand store', () => {
      mockUseColorScheme.mockReturnValue({
        mode: 'dark',
        setMode: mockJoySetMode,
      })

      renderHook(() => useMode())

      expect(mockSetMode).toHaveBeenCalledWith('dark')
    })

    it('syncs Joy UI light mode to Zustand store', () => {
      mockUseColorScheme.mockReturnValue({
        mode: 'light',
        setMode: mockJoySetMode,
      })

      renderHook(() => useMode())

      expect(mockSetMode).toHaveBeenCalledWith('light')
    })

    it('maps Joy UI system mode to light in Zustand store', () => {
      mockUseColorScheme.mockReturnValue({
        mode: 'system',
        setMode: mockJoySetMode,
      })

      renderHook(() => useMode())

      expect(mockSetMode).toHaveBeenCalledWith('light')
    })

    it('updates Zustand store when Joy UI mode changes', () => {
      let currentJoyMode = 'light'
      mockUseColorScheme.mockImplementation(() => ({
        mode: currentJoyMode,
        setMode: mockJoySetMode,
      }))

      const { rerender } = renderHook(() => useMode())

      // Change Joy UI mode to dark
      currentJoyMode = 'dark'
      act(() => {
        rerender()
      })

      expect(mockSetMode).toHaveBeenCalledWith('dark')
    })
  })

  describe('State Synchronization Tests', () => {
    it('syncs Joy UI mode changes to Zustand store', () => {
      let joyMode = 'light'

      mockUseColorScheme.mockImplementation(() => ({
        mode: joyMode,
        setMode: mockJoySetMode,
      }))

      const { rerender } = renderHook(() => useMode())

      // Joy UI mode changes to dark
      joyMode = 'dark'
      act(() => {
        rerender()
      })

      expect(mockSetMode).toHaveBeenCalledWith('dark')
    })

    it('maintains synchronization when Joy UI mode changes multiple times', () => {
      let joyMode = 'light'

      mockUseColorScheme.mockImplementation(() => ({
        mode: joyMode,
        setMode: mockJoySetMode,
      }))

      const { rerender } = renderHook(() => useMode())

      // Joy UI mode changes to dark
      joyMode = 'dark'
      act(() => {
        rerender()
      })
      expect(mockSetMode).toHaveBeenCalledWith('dark')
    })

    it('syncs Joy UI mode back to light after switching from dark', () => {
      let joyMode = 'dark'

      mockUseColorScheme.mockImplementation(() => ({
        mode: joyMode,
        setMode: mockJoySetMode,
      }))

      const { rerender } = renderHook(() => useMode())

      // Joy UI mode changes to light
      joyMode = 'light'
      act(() => {
        rerender()
      })
      expect(mockSetMode).toHaveBeenCalledWith('light')
    })

    it('correctly maps system mode to light in Zustand', () => {
      const joyMode = 'system'

      mockUseColorScheme.mockImplementation(() => ({
        mode: joyMode,
        setMode: mockJoySetMode,
      }))

      renderHook(() => useMode())

      // Joy UI mode is system, should map to light
      expect(mockSetMode).toHaveBeenCalledWith('light')
    })

    it('syncs Joy UI mode to dark after switching from system', () => {
      let joyMode = 'system'

      mockUseColorScheme.mockImplementation(() => ({
        mode: joyMode,
        setMode: mockJoySetMode,
      }))

      const { rerender } = renderHook(() => useMode())

      // Change to dark
      joyMode = 'dark'
      act(() => {
        rerender()
      })
      expect(mockSetMode).toHaveBeenCalledWith('dark')
    })
  })
})
