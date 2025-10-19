import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppContent } from './App'

// Mock the auth store
vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/store/auth'

const mockedUseAuthStore = vi.mocked(useAuthStore)

// Mock the routes
vi.mock('@/lib/routes', () => ({
  appRoutes: [
    {
      label: 'Home',
      href: '/',
      requiresAuth: false,
      page: () => <div>Home Page</div>,
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      requiresAuth: true,
      page: () => <div>Dashboard Page</div>,
    },
    {
      label: 'Admin',
      href: '/admin',
      requiresAuth: true,
      requiredRole: 'admin',
      page: () => <div>Admin Page</div>,
    },
    {
      label: 'Sign In',
      href: '/signin',
      requiresAuth: false,
      page: () => <div>Sign In Page</div>,
    },
    {
      label: 'Forbidden',
      href: '/forbidden',
      requiresAuth: false,
      page: () => <div>Forbidden Page</div>,
    },
  ],
}))

// Mock the Layout component
vi.mock('@/components/layout/layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock the ProtectedRoute component
vi.mock('@/providers/ProtectedRouteProvider', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

describe('App Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows access to public routes for unauthenticated users', () => {
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
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
      }),
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('redirects unauthenticated users from protected routes to signin', () => {
    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
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
      }),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(screen.getByText('Sign In Page')).toBeInTheDocument()
  })

  it('allows authenticated users to access protected routes', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      phoneNumber: '123-456-7890',
      role: 'user',
    }

    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: mockUser,
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
      }),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('redirects non-admin users from admin routes to forbidden', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      phoneNumber: '123-456-7890',
      role: 'user',
    }

    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: mockUser,
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
      }),
    )

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(screen.getByText('Forbidden Page')).toBeInTheDocument()
  })

  it('allows admin users to access admin routes', () => {
    const mockAdminUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      phoneNumber: '123-456-7890',
      role: 'admin',
    }

    mockedUseAuthStore.mockImplementation((selector) =>
      selector({
        user: mockAdminUser,
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
      }),
    )

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppContent />
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin Page')).toBeInTheDocument()
  })
})
