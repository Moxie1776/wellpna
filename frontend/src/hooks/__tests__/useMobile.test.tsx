import { act, renderHook } from '@testing-library/react'

import { useIsMobile } from '../useMobile'

describe('useIsMobile', () => {
  let originalWindow: any
  let mockMatchMedia: jest.Mock
  let mockMediaQuery: {
    addEventListener: jest.Mock
    removeEventListener: jest.Mock
    matches: boolean
  }

  beforeEach(() => {
    // Store original window
    originalWindow = global.window

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Mock matchMedia
    mockMediaQuery = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      matches: false,
    }

    mockMatchMedia = jest.fn(() => mockMediaQuery)

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    // Restore original window
    global.window = originalWindow
    jest.clearAllMocks()
  })

  describe('Initial State Tests', () => {
    it('returns false for desktop width (>= 768px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('returns true for mobile width (< 768px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 767 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('returns false for exact breakpoint (768px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })
  })

  describe('Resize Handling Tests', () => {
    it('updates state when window resizes from desktop to mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', { value: 767 })
      act(() => {
        // Trigger the change event
        const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
          ([event]) => event === 'change',
        )?.[1]
        changeHandler?.()
      })

      expect(result.current).toBe(true)
    })

    it('updates state when window resizes from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 767 })
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      act(() => {
        const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
          ([event]) => event === 'change',
        )?.[1]
        changeHandler?.()
      })

      expect(result.current).toBe(false)
    })
  })

  describe('Breakpoint Tests', () => {
    it('correctly identifies mobile at 767px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 767 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('correctly identifies desktop at 768px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('correctly identifies mobile at 320px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 320 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('correctly identifies desktop at 1920px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920 })

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })
  })

  describe('Event Listener Tests', () => {
    it('adds event listener on mount', () => {
      renderHook(() => useIsMobile())

      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })

    it('removes event listener on unmount', () => {
      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })
  })

  describe('SSR Compatibility Tests', () => {
    it('returns false when window is undefined (SSR)', () => {
      // Mock window as undefined
      delete (global as any).window

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })
  })

  describe('Multiple Resize Tests', () => {
    it('updates to mobile after rapid resize to 767px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)

      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        ([event]) => event === 'change',
      )?.[1]

      Object.defineProperty(window, 'innerWidth', { value: 767 })
      act(() => changeHandler?.())
      expect(result.current).toBe(true)
    })

    it('remains mobile after rapid resize to 500px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 767 })
      const { result } = renderHook(() => useIsMobile())
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        ([event]) => event === 'change',
      )?.[1]

      Object.defineProperty(window, 'innerWidth', { value: 500 })
      act(() => changeHandler?.())
      expect(result.current).toBe(true)
    })

    it('updates to desktop after rapid resize to 1024px', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      const { result } = renderHook(() => useIsMobile())
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        ([event]) => event === 'change',
      )?.[1]

      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      act(() => changeHandler?.())
      expect(result.current).toBe(false)
    })

    it('maintains state consistency across multiple resizes', () => {
      Object.defineProperty(window, 'innerWidth', { value: 767 })
      const { result } = renderHook(() => useIsMobile())
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        ([event]) => event === 'change',
      )?.[1]

      // Multiple resizes maintaining mobile state
      for (let width = 767; width >= 320; width -= 50) {
        Object.defineProperty(window, 'innerWidth', { value: width })
        act(() => changeHandler?.())
        expect(result.current).toBe(true)
      }
    })

    it('switches to desktop after multiple mobile resizes', () => {
      Object.defineProperty(window, 'innerWidth', { value: 320 })
      const { result } = renderHook(() => useIsMobile())
      const changeHandler = mockMediaQuery.addEventListener.mock.calls.find(
        ([event]) => event === 'change',
      )?.[1]

      Object.defineProperty(window, 'innerWidth', { value: 768 })
      act(() => changeHandler?.())
      expect(result.current).toBe(false)
    })
  })
})
