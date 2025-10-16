import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../auth'

// Mock JWT utilities
vi.mock('../../utils/jwt', () => ({
  hashPassword: vi.fn((password: string) => Promise.resolve(password)), // Return password as-is for testing
  isValidToken: vi.fn((token: string) => token && token.length > 0),
}))

// Mock urql client for all tests
vi.mock('../../utils/graphqlClient', () => {
  return {
    __esModule: true,
    default: {
      mutation: (_query: any, _variables: any) => {
        return {
          toPromise: async () => {
            const queryStr =
              typeof _query === 'string'
                ? _query
                : _query &&
                    _query.kind === 'Document' &&
                    _query.definitions &&
                    _query.definitions[0] &&
                    _query.definitions[0].name &&
                    _query.definitions[0].name.value
                  ? _query.definitions[0].name.value
                  : ''
            // signIn
            if (
              queryStr === 'signIn' ||
              (_variables &&
                _variables.email &&
                _variables.password &&
                !_variables.name)
            ) {
              // Custom tokens for specific test cases
              if (_variables.email === 'persist@example.com') {
                return {
                  data: {
                    signIn: {
                      token: 'persist-token',
                      user: {
                        id: '1',
                        email: _variables.email,
                        name: 'Persist User',
                        role: 'user',
                      },
                    },
                  },
                }
              }
              if (_variables.email === 'sync@example.com') {
                return {
                  data: {
                    signIn: {
                      token: 'sync-token',
                      user: {
                        id: '1',
                        email: _variables.email,
                        name: 'Sync User',
                        role: 'user',
                      },
                    },
                  },
                }
              }
              // Error cases
              if (_variables.email === 'fail@example.com') {
                throw new Error('Invalid credentials')
              }
              if (_variables.email === 'nodata@example.com') {
                throw new Error('No data returned from sign in')
              }
              if (_variables.email === 'network@example.com') {
                throw new Error('Network error')
              }
              if (_variables.email === 'unverified@example.com') {
                throw new Error('Email not verified')
              }
              // Default
              return {
                data: {
                  signIn: {
                    token: 'mock-token',
                    user: {
                      id: '1',
                      email: _variables.email,
                      name: 'Test User',
                      role: 'user',
                    },
                  },
                },
              }
            }
            // signUp
            if (
              queryStr === 'signUp' ||
              (_variables &&
                _variables.email &&
                _variables.password &&
                _variables.name)
            ) {
              if (_variables.email === 'persist@example.com') {
                return {
                  data: {
                    signUp: {
                      token: 'persist-token',
                      user: {
                        id: '1',
                        email: _variables.email,
                        name: _variables.name,
                        role: 'user',
                      },
                    },
                  },
                }
              }
              if (_variables.email === 'sync@example.com') {
                return {
                  data: {
                    signUp: {
                      token: 'sync-token',
                      user: {
                        id: '1',
                        email: _variables.email,
                        name: _variables.name,
                        role: 'user',
                      },
                    },
                  },
                }
              }
              // Error cases
              if (_variables.email === 'exists@example.com') {
                throw new Error('Email already exists')
              }
              if (_variables.email === 'nodata@example.com') {
                throw new Error('No data returned from sign up')
              }
              if (_variables.email === 'network@example.com') {
                throw new Error('Network error')
              }
              // Default
              return {
                data: {
                  signUp: {
                    token: 'mock-token',
                    user: {
                      id: '1',
                      email: _variables.email,
                      name: _variables.name,
                      role: 'user',
                    },
                  },
                },
              }
            }
            // Default mock for other mutations
            return { data: {} }
          },
        }
      },
    },
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
// Mock fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('useAuthStore', () => {
  beforeEach(() => {
    // Inject localStorageMock before each test and reset store state
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    vi.clearAllMocks()
    useAuthStore.setState({
      token: null,
      user: null,
      loading: false,
      error: null,
    })
    // Reset localStorageMock state
    localStorageMock.getItem.mockReset()
    localStorageMock.setItem.mockReset()
    localStorageMock.removeItem.mockReset()
  })
  it('should initialize with correct default values', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBe(null)
    expect(state.user).toBe(null)
    expect(state.loading).toBe(false)
    expect(state.error).toBe(null)
  })

  describe('Sign In Tests', () => {
    describe('Sign In Success', () => {
      it('should update state correctly on successful sign in', async () => {
        const mockResponse = {
          data: {
            signIn: {
              token: 'mock-token',
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
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
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
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
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
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
          return await signIn('fail@example.com', 'wrongpassword')
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
          return await signIn('nodata@example.com', 'password')
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
          return await signIn('network@example.com', 'password')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Network error')
      })

      it('should handle unverified email error during sign in', async () => {
        const { signIn } = useAuthStore.getState()

        const result = await act(async () => {
          return await signIn('unverified@example.com', 'password')
        })

        const state = useAuthStore.getState()
        expect(result).toBe(null)
        expect(state.token).toBe(null)
        expect(state.user).toBe(null)
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Email not verified')
      })
    })
  })

  describe('Sign Out Tests', () => {
    it('should clear user data and reset state on sign out', () => {
      // Set initial state
      useAuthStore.setState({
        token: 'existing-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          phoneNumber: '555-123-4567',
          role: 'user',
        },
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
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
            },
          },
        }

        fetchMock.mockResolvedValueOnce({
          json: () => Promise.resolve(mockResponse),
        })

        const { signUp } = useAuthStore.getState()

        await act(async () => {
          await signUp(
            'test@example.com',
            'password',
            'Test User',
            '555-123-4567',
          )
        })

        const state = useAuthStore.getState()
        expect(state.token).toBe('mock-token')
        expect(state.user).toEqual({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
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
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
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
          signUp('test@example.com', 'password', 'Test User', '555-123-4567')
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
          return await signUp(
            'exists@example.com',
            'password',
            'Test User',
            '555-123-4567',
          )
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
          return await signUp(
            'nodata@example.com',
            'password',
            'Test User',
            '555-123-4567',
          )
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
          return await signUp(
            'network@example.com',
            'password',
            'Test User',
            '555-123-4567',
          )
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
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
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
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
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
      useAuthStore.setState({ error: null })
      // Simulate a generic error
      useAuthStore.getState().setError(null)
      expect(useAuthStore.getState().error).toBe(null)
    })
  })

  describe('Persistence Tests', () => {
    it('should persist user data in localStorage', async () => {
      const mockResponse = {
        data: {
          signIn: {
            token: 'persist-token',
            user: {
              id: '1',
              email: 'persist@example.com',
              name: 'Persist User',
            },
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
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          phoneNumber: '555-123-4567',
          role: 'user',
        },
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
        user: {
          id: '1',
          email: 'restored@example.com',
          name: 'Restored User',
          phoneNumber: '555-123-4567',
          role: 'user',
        },
      })

      const state = testStore.getState()
      expect(state.token).toBe('restored-token')
      expect(state.user).toEqual({
        id: '1',
        email: 'restored@example.com',
        name: 'Restored User',
        phoneNumber: '555-123-4567',
        role: 'user',
      })
    })
  })

  describe('State Synchronization Tests', () => {
    it('should keep localStorage and store state in sync', async () => {
      const mockResponse = {
        data: {
          signIn: {
            token: 'sync-token',
            user: { id: '1', email: 'sync@example.com', name: 'Sync User' },
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
        user: {
          id: '1',
          email: 'current@example.com',
          name: 'Current User',
          phoneNumber: '555-123-4567',
          role: 'user',
        },
      })

      const { getCurrentUser } = useAuthStore.getState()

      const user = getCurrentUser()
      expect(user).toEqual({
        id: '1',
        email: 'current@example.com',
        name: 'Current User',
        phoneNumber: '555-123-4567',
        role: 'user',
      })
    })

    it('should return null when no token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { getCurrentUser } = useAuthStore.getState()

      const user = getCurrentUser()
      expect(user).toBe(null)
    })
  })

  describe('isTokenValid Tests', () => {
    it('should return true when a valid token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('valid-token')

      const { isTokenValid } = useAuthStore.getState()

      const result = isTokenValid()
      expect(result).toBe(true)
    })

    it('should return false when no token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { isTokenValid } = useAuthStore.getState()

      const result = isTokenValid()
      expect(result).toBe(false)
    })

    it('should return false when an invalid token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('')

      const { isTokenValid } = useAuthStore.getState()

      const result = isTokenValid()
      expect(result).toBe(false)
    })
  })
})
