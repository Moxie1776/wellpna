import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Admin } from '../Admin'

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// useAuth import intentionally removed; module is mocked above

// Mock the UserManagementTable component
vi.mock('@/components/tables/UserManagementTable', () => ({
  UserManagementTable: () => <div>User Management Table</div>,
}))

describe('Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders admin content', () => {
    render(<Admin />)

    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('User Management Table')).toBeInTheDocument()
  })
})
