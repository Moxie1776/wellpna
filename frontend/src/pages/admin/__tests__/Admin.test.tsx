import { render, screen } from '@testing-library/react'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { Admin } from '../Admin'

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'

const mockedUseAuth = vi.mocked(useAuth)

// Mock the UserManagementTable component
vi.mock('@/components/tables/UserManagementTable', () => ({
  UserManagementTable: () => <div>User Management Table</div>,
}))

describe('Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows access denied for non-admin users', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      phoneNumber: '123-456-7890',
      role: 'user',
    }

    mockedUseAuth.mockReturnValue({
      user: mockUser,
      token: 'fake-token',
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
    })

    render(<Admin />)

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(
      screen.getByText('You do not have permission to access this page.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('User Management')).not.toBeInTheDocument()
  })

  it('shows admin content for admin users', () => {
    const mockAdminUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      phoneNumber: '123-456-7890',
      role: 'admin',
    }

    mockedUseAuth.mockReturnValue({
      user: mockAdminUser,
      token: 'fake-token',
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
    })

    render(<Admin />)

    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('User Management Table')).toBeInTheDocument()
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
  })

  it('shows access denied when user is null', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
    })

    render(<Admin />)

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('User Management')).not.toBeInTheDocument()
  })
})