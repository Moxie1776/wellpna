// Mock Navigate first
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  Navigate: vi.fn(() => <div data-testid="navigate-mock">Navigate</div>),
}))

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAuthStore } from '../../store/auth'
import { ProtectedRoute } from '../ProtectedRouteProvider'

// Mock useAuthStore
vi.mock('../../store/auth', () => ({
  useAuthStore: vi.fn(),
}))

const mockUseAuthStore = useAuthStore as any

describe('ProtectedRoute', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user exists', () => {
    mockUseAuthStore.mockReturnValue({ id: '1', email: 'test@example.com' })

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('navigates to "/" when user does not exist', () => {
    mockUseAuthStore.mockReturnValue(null)

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>,
    )

    // Since Navigate is mocked to return a div, it should be rendered
    expect(screen.getByTestId('navigate-mock')).toBeInTheDocument()
    // Protected content should not be rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
