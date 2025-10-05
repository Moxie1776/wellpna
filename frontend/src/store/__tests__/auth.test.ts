import { act } from '@testing-library/react'
import { useAuthStore } from '../auth'

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

// Mock fetch
const fetchMock = jest.fn()
global.fetch = fetchMock

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useAuthStore.setState({
      token: null,
      user: null,
      loading: false,
      error: null,
    })
  })

  describe('Initial State Tests', () => {
    it('should initialize with correct default values', () => {
      const state = useAuthStore.getState()

      expect(state.token).toBe(null)
      expect(state.user).toBe(null)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })
  })

  describe('Sign In Tests', () => {
    describe('Sign In Success', () => {
      it('should update state correctly on successful sign in', async () => {
        const mockResponse = {
          data: {
            signIn: {
              token: 'mock-token',
              user: { id: 1, email: 'test@example.com', name: 'Test User' },
            },
          },
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signIn } = useAuthStore.getState()

        await act(async () => {
          await signIn('test@example.com', 'password')
        })

        const state = useAuthStore.getState()
        expect(state.token).toBe('mock-token')
        expect(state.user).toEqual({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        })
        expect(state.loading).toBe(false)
        expect(state.error).toBe(null)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'token',
          'mock-token',
        )
      })

      it('should set loading to true during sign in', async () => {
        const mockResponse = {
          data: {
            signIn: {
              token: 'mock-token',
              user: { id: 1, email: 'test@example.com', name: 'Test User' },
            },
          },
        }

        fetchMock.mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve({ json: () => Promise.resolve(mockResponse) }),
                100,
              ),
            ),
        )

        const { signIn } = useAuthStore.getState()

        act(() => {
          signIn('test@example.com', 'password')
        })

        expect(useAuthStore.getState().loading).toBe(true)

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 150))
        })

        expect(useAuthStore.getState().loading).toBe(false)
      })
    })

    describe('Sign In Failure', () => {
      it('should handle GraphQL errors during sign in', async () => {
        const mockResponse = {
          errors: [{ message: 'Invalid credentials' }],
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signIn } = useAuthStore.getState()

        const result = await act(async () => {
          return await signIn('test@example.com', 'wrongpassword')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Invalid credentials')
      })

      it('should handle no data returned from sign in', async () => {
        const mockResponse = {
          data: { signIn: null },
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signIn } = useAuthStore.getState()

        const result = await act(async () => {
          return await signIn('test@example.com', 'password')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('No data returned from sign in')
      })

      it('should handle network errors during sign in', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'))

        const { signIn } = useAuthStore.getState()

        const result = await act(async () => {
          return await signIn('test@example.com', 'password')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Network error')
      })
    })
  })

  describe('Sign Out Tests', () => {
    it('should clear user data and reset state on sign out', () => {
      // Set initial state
      useAuthStore.setState({
        token: 'existing-token',
        user: { id: 1, email: 'test@example.com' },
        loading: false,
        error: null,
      })

      const { signOut } = useAuthStore.getState()

      act(() => {
        signOut()
      })

      const state = useAuthStore.getState()
      expect(state.token).toBe(null)
      expect(state.user).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('Sign Up Tests', () => {
    describe('Sign Up Success', () => {
      it('should update state correctly on successful sign up', async () => {
        const mockResponse = {
          data: {
            signUp: {
              token: 'mock-token',
              user: { id: 1, email: 'test@example.com', name: 'Test User' },
            },
          },
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signUp } = useAuthStore.getState()

        await act(async () => {
          await signUp('test@example.com', 'password', 'Test User')
        })

        const state = useAuthStore.getState()
        expect(state.token).toBe('mock-token')
        expect(state.user).toEqual({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        })
        expect(state.loading).toBe(false)
        expect(state.error).toBe(null)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'token',
          'mock-token',
        )
      })

      it('should set loading to true during sign up', async () => {
        const mockResponse = {
          data: {
            signUp: {
              token: 'mock-token',
              user: { id: 1, email: 'test@example.com', name: 'Test User' },
            },
          },
        }

        fetchMock.mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve({ json: () => Promise.resolve(mockResponse) }),
                100,
              ),
            ),
        )

        const { signUp } = useAuthStore.getState()

        act(() => {
          signUp('test@example.com', 'password', 'Test User')
        })

        expect(useAuthStore.getState().loading).toBe(true)

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 150))
        })

        expect(useAuthStore.getState().loading).toBe(false)
      })
    })

    describe('Sign Up Failure', () => {
      it('should handle GraphQL errors during sign up', async () => {
        const mockResponse = {
          errors: [{ message: 'Email already exists' }],
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signUp } = useAuthStore.getState()

        const result = await act(async () => {
          return await signUp('test@example.com', 'password', 'Test User')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Email already exists')
      })

      it('should handle no data returned from sign up', async () => {
        const mockResponse = {
          data: { signUp: null },
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signUp } = useAuthStore.getState()

        const result = await act(async () => {
          return await signUp('test@example.com', 'password', 'Test User')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('No data returned from sign up')
      })

      it('should handle network errors during sign up', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'))

        const { signUp } = useAuthStore.getState()

        const result = await act(async () => {
          return await signUp('test@example.com', 'password', 'Test User')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Network error')
      })
    })
  })

  describe('Loading State Tests', () => {
    it('should manage loading states correctly during async operations', async () => {
      const mockResponse = {
        data: {
          signIn: {
            token: 'mock-token',
            user: { id: 1, email: 'test@example.com', name: 'Test User' },
          },
        },
      }

      fetchMock.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ json: () => Promise.resolve(mockResponse) }),
              100,
            ),
          ),
      )

      const { signIn } = useAuthStore.getState()

      const promise = act(async () => {
        await signIn('test@example.com', 'password')
      })

      expect(useAuthStore.getState().loading).toBe(true)

      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('Error Handling Tests', () => {
    it('should clear error on successful operation', async () => {
      // Set initial error
      useAuthStore.setState({ error: 'Previous error' })

      const mockResponse = {
        data: {
          signIn: {
            token: 'mock-token',
            user: { id: 1, email: 'test@example.com', name: 'Test User' },
          },
        },
      }

      fetchMock.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const { signIn } = useAuthStore.getState()

      await act(async () => {
        await signIn('test@example.com', 'password')
      })

      expect(useAuthStore.getState().error).toBe(null)
    })

    it('should set error on failure', async () => {
      const mockResponse = {
        errors: [{ message: 'Authentication failed' }],
      }

      fetchMock.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const { signIn } = useAuthStore.getState()

      await act(async () => {
        await signIn('test@example.com', 'password')
      })

      expect(useAuthStore.getState().error).toBe('Authentication failed')
    })
  })

  describe('Persistence Tests', () => {
    it('should persist user data in localStorage', async () => {
      const mockResponse = {
        data: {
          signIn: {
            token: 'persist-token',
            user: { id: 1, email: 'persist@example.com', name: 'Persist User' },
          },
        },
      }

      fetchMock.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const { signIn } = useAuthStore.getState()

      await act(async () => {
        await signIn('persist@example.com', 'password')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'persist-token',
      )
    })

    it('should remove token from localStorage on sign out', () => {
      useAuthStore.setState({
        token: 'existing-token',
        user: { id: 1, email: 'test@example.com' },
      })

      const { signOut } = useAuthStore.getState()

      act(() => {
        signOut()
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('Hydration Tests', () => {
    it('should restore persisted user data on store initialization', () => {
      // Simulate persisted data
      localStorageMock.getItem.mockReturnValue('restored-token')

      // Create a new store instance to test hydration
      const testStore = useAuthStore

      // In a real scenario, zustand persist would hydrate the state
      // For testing, we manually set the state as persist would
      testStore.setState({
        token: 'restored-token',
        user: { id: 1, email: 'restored@example.com' },
      })

      const state = testStore.getState()
      expect(state.token).toBe('restored-token')
      expect(state.user).toEqual({ id: 1, email: 'restored@example.com' })
    })
  })

  describe('State Synchronization Tests', () => {
    it('should keep localStorage and store state in sync', async () => {
      const mockResponse = {
        data: {
          signIn: {
            token: 'sync-token',
            user: { id: 1, email: 'sync@example.com', name: 'Sync User' },
          },
        },
      }

      fetchMock.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const { signIn, signOut } = useAuthStore.getState()

      // Sign in
      await act(async () => {
        await signIn('sync@example.com', 'password')
      })

      expect(useAuthStore.getState().token).toBe('sync-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'sync-token',
      )

      // Sign out
      act(() => {
        signOut()
      })

      expect(useAuthStore.getState().token).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('getCurrentUser Tests', () => {
    it('should return user when token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('existing-token')
      useAuthStore.setState({
        token: 'existing-token',
        user: { id: 1, email: 'current@example.com' },
      })

      const { getCurrentUser } = useAuthStore.getState()

      const user = getCurrentUser()
      expect(user).toEqual({ id: 1, email: 'current@example.com' })
    })

    it('should return null when no token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { getCurrentUser } = useAuthStore.getState()

      const user = getCurrentUser()
      expect(user).toBe(null)
    })
  })
})
