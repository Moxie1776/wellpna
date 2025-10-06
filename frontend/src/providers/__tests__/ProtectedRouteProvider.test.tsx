// Mock Navigate first
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(() => <div data-testid="navigate-mock">Navigate</div>),
}))

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAuthStore } from '../../store/auth'
import { ProtectedRoute } from '../ProtectedRouteProvider'

// Mock useAuthStore
jest.mock('../../store/auth', () => ({
  useAuthStore: jest.fn(),
}))

const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>

describe('ProtectedRoute', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when user exists', () => {
    mockUseAuthStore.mockReturnValue({ id: 1, email: 'test@example.com' })

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
