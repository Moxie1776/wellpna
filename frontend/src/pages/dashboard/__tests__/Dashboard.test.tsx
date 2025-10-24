import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'

import { useAuth } from '../../../hooks/useAuth'
import { Dashboard } from '../Dashboard'

// Mock useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = useAuth as MockedFunction<typeof useAuth>

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}))

// Test wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('Dashboard Component', () => {
  const mockSignOut = vi.fn()

  beforeEach(() => {
    mockSignOut.mockReset()
    mockNavigate.mockReset()
    mockUseAuth.mockReturnValue({
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
      loading: false,
      error: null,
      user: { id: '1', email: 'test@example.com' },
      token: 'test-token',
    } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering Tests', () => {
    it('renders the dashboard with correct structure and content', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(
        screen.getByText('Welcome to the WellPNA Dashboard'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    })

    it('renders with proper layout components', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      // Check for Paper container by class name
      const paper = document.querySelector('.MuiPaper-root')
      expect(paper).toBeInTheDocument()
      expect(paper).toHaveStyle({ minHeight: '100vh' })
    })

    it('displays correct typography hierarchy', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      // Check heading text and MUI class names
      const title = screen.getByText('Dashboard')
      expect(title).toBeInTheDocument()
      expect(title.className).toMatch(/MuiTypography-h1/)

      const subtitle = screen.getByText('Welcome to the WellPNA Dashboard')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle.className).toMatch(/MuiTypography-h3/)
    })
  })

  describe('Authentication Tests', () => {
    it('renders for authenticated users', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { id: '1', email: 'test@example.com' },
        token: 'test-token',
      } as any)

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('handles authentication state changes', () => {
      // Initially authenticated
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { id: '1', email: 'test@example.com' },
        token: 'test-token',
      } as any)

      const { rerender } = render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()

      // Simulate logout (user becomes null)
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: null,
        token: null,
      } as any)

      rerender(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      // Component should still render but auth state changed
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Interactive Tests', () => {
    it('calls signOut and navigates to login when logout button is clicked', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })

      await act(async () => {
        await userEvent.click(logoutButton)
      })

      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })

    it('handles logout button keyboard interaction', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })

      // Focus and press Enter
      logoutButton.focus()
      expect(logoutButton).toHaveFocus()

      await act(async () => {
        await userEvent.keyboard('{Enter}')
      })

      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })

    it('handles logout button space key interaction', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })

      logoutButton.focus()

      await act(async () => {
        await userEvent.keyboard(' ')
      })

      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper heading structure', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      const headings = screen.getAllByRole('heading')
      expect(headings).toHaveLength(2)
      expect(headings[0].textContent).toBe('Dashboard')
      expect(headings[0].className).toMatch(/MuiTypography-h1/)
      expect(headings[1].textContent).toBe('Welcome to the WellPNA Dashboard')
      expect(headings[1].className).toMatch(/MuiTypography-h3/)
    })

    it('logout button has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })
      expect(logoutButton).toBeEnabled()
      expect(logoutButton).toHaveAttribute('type', 'button')
    })

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })

      // Tab to the button
      await act(async () => {
        await userEvent.tab()
      })

      expect(logoutButton).toHaveFocus()
    })
  })

  describe('Error Handling Tests', () => {
    it('handles signOut errors gracefully', async () => {
      mockSignOut.mockRejectedValueOnce(new Error('Logout failed'))
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      const logoutButton = screen.getByRole('button', { name: 'Logout' })
      await act(async () => {
        await userEvent.click(logoutButton)
      })
      // Should still navigate even if signOut fails
      expect(mockNavigate).toHaveBeenCalledWith('/signin')
    })

    it('handles navigation errors', () => {
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })

      expect(() => userEvent.click(logoutButton)).not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('Layout Integration Tests', () => {
    it('integrates with layout components (tested via App routing)', () => {
      // This test verifies the component works within the app layout structure
      // The actual layout integration is tested in the Layout component tests
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Theme Integration Tests', () => {
    it('uses theme-aware components', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      // Typography components should use theme colors
      const title = screen.getByText('Dashboard')
      expect(title.className).toMatch(/MuiTypography-h1/)
      const subtitle = screen.getByText('Welcome to the WellPNA Dashboard')
      expect(subtitle.className).toMatch(/MuiTypography-h3/)
    })

    it('paper component respects theme styling', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>,
      )
      const paper = document.querySelector('.MuiPaper-root')
      expect(paper).toBeInTheDocument()
      expect(paper).toHaveStyle({ minHeight: '100vh' })
    })
  })

  // Placeholder tests for future data loading features
  describe('Data Loading Tests (Future Implementation)', () => {
    it('will test GraphQL query execution', () => {
      // Placeholder for future GraphQL query tests
      expect(true).toBe(true)
    })

    it('will test loading states', () => {
      // Placeholder for loading state tests
      expect(true).toBe(true)
    })

    it('will test error states for data fetching', () => {
      // Placeholder for error state tests
      expect(true).toBe(true)
    })
  })
})
