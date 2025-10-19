import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { ProtectedRoute } from '../ProtectedRouteProvider'

// Mock the auth store
vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/store/auth'

const mockedUseAuthStore = vi.mocked(useAuthStore)

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    const mockState = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phoneNumber: '123-456-7890',
        role: 'user',
      },
      token: 'fake-token',
      loading: false,
      error: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      updateUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
      isTokenValid: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      initializeAuth: vi.fn(),
    }

    mockedUseAuthStore.mockImplementation((selector) => selector(mockState))

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    const mockState = {
      user: null,
      token: null,
      loading: false,
      error: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      updateUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
      isTokenValid: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      initializeAuth: vi.fn(),
    }
    
    mockedUseAuthStore.mockImplementation((selector) => selector(mockState))

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    // When unauthenticated, children should not be rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
