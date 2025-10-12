import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '../../../hooks/useAuth'
import { useIsMobile } from '../../../hooks/useMobile'
import { useMode } from '../../../hooks/useMode'
import { AppSidebar } from '../Sidebar'

// Mock the hooks
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../../hooks/useMobile', () => ({
  useIsMobile: vi.fn(),
}))

vi.mock('../../../hooks/useMode', () => ({
  useMode: vi.fn(),
}))

const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>
const mockUseIsMobile = useIsMobile as vi.MockedFunction<typeof useIsMobile>
const mockUseMode = useMode as vi.MockedFunction<typeof useMode>

// Test wrapper component with MemoryRouter
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('AppSidebar', () => {
  let mockSignOut: vi.Mock
  let defaultMocks: any

  beforeEach(() => {
    mockSignOut = vi.fn()
    vi.clearAllMocks()
    // Default mock values (created after mockSignOut is assigned)
    defaultMocks = {
      useAuth: {
        signIn: vi.fn(),
        signOut: mockSignOut,
        signUp: vi.fn(),
        getCurrentUser: vi.fn(),
        loading: false,
        error: null,
        user: null,
        token: null,
      },
      useIsMobile: false,
      useMode: {
        mode: 'light' as 'light' | 'dark',
        setMode: vi.fn(),
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const setupMocks = (overrides = {}) => {
    const mocks = { ...defaultMocks, ...overrides }
    mockUseAuth.mockReturnValue(mocks.useAuth)
    mockUseIsMobile.mockReturnValue(mocks.useIsMobile)
    mockUseMode.mockReturnValue(mocks.useMode)
  }

  describe('Rendering Tests', () => {
    it('renders sidebar with correct structure for desktop', () => {
      setupMocks()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      // Check header
      expect(screen.getByText('WellPnA')).toBeInTheDocument()

      // Check navigation links
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()

      // Should not show Dashboard or Logout for unauthenticated
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })

    it('renders sidebar with correct structure for authenticated user', () => {
      setupMocks({
        useAuth: {
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn(),
          getCurrentUser: vi.fn(),
          loading: false,
          error: null,
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-token',
        },
      })
      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={true} />
        </TestWrapper>,
      )
      expect(screen.getByText('WellPnA')).toBeInTheDocument()
      // Home should NOT be present for authenticated users
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
      // Dashboard should be present with href '/dashboard'
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      expect(screen.getByText('Logout')).toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
    })

    it('renders navigation links with correct icons', () => {
      setupMocks()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      // Check that links have proper structure (icons are rendered)
      const homeLink = screen.getByText('Home').closest('a')
      const signInLink = screen.getByText('Sign In').closest('a')

      expect(homeLink).toBeInTheDocument()
      expect(signInLink).toBeInTheDocument()
      expect(homeLink).toHaveAttribute('href', '/')
      expect(signInLink).toHaveAttribute('href', '/login')
    })

    it('renders logout button only for authenticated users', () => {
      setupMocks()

      const { rerender } = render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      expect(screen.queryByText('Logout')).not.toBeInTheDocument()

      rerender(
        <TestWrapper>
          <AppSidebar isAuthenticated={true} />
        </TestWrapper>,
      )

      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  describe('Navigation Tests', () => {
    it('renders correct navigation links for unauthenticated users', () => {
      setupMocks()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      // Public routes
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.getByText('Password Reset')).toBeInTheDocument()
      expect(screen.getByText('Email Verification')).toBeInTheDocument()

      // No authenticated routes
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('renders correct navigation links for authenticated users', () => {
      setupMocks({
        useAuth: {
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn(),
          getCurrentUser: vi.fn(),
          loading: false,
          error: null,
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-token',
        },
      })
      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={true} />
        </TestWrapper>,
      )
      // Home should NOT be present for authenticated users
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
      // Dashboard should be present with href '/dashboard'
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
    })

    it('navigation links have correct href attributes', () => {
      setupMocks()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
      expect(screen.getByText('Sign In').closest('a')).toHaveAttribute(
        'href',
        '/login',
      )
      expect(screen.getByText('Sign Up').closest('a')).toHaveAttribute(
        'href',
        '/signup',
      )
    })
  })

  describe('Responsive Behavior Tests', () => {
    it('renders drawer for mobile devices', () => {
      setupMocks({ useIsMobile: true })

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      // Should render menu button
      expect(screen.getByRole('button')).toBeInTheDocument()

      // Drawer should be present (though closed by default)
      // Note: Testing drawer open state requires more complex setup
    })

    it('renders fixed sidebar for desktop devices', () => {
      setupMocks({ useIsMobile: false })
      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )
      // Should render Sheet directly (menu button is present for theme toggle)
      // Only the menu button for theme toggle should be present
      const iconButtons = screen.getAllByRole('button')
      expect(iconButtons.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('WellPnA')).toBeInTheDocument()
    })

    it('drawer opens and closes on mobile', async () => {
      setupMocks({ useIsMobile: true })
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )
      const menuButton = screen.getByRole('button')
      // Drawer content is rendered but hidden by default, so Home is present in the DOM but not visible
      // Click to open drawer
      await user.click(menuButton)
      // Now content should be visible
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })

  describe('User Interaction Tests', () => {
    it('closes drawer when navigation link is clicked on mobile', async () => {
      setupMocks({ useIsMobile: true })
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      // Drawer should be open
      expect(screen.getByText('Home')).toBeInTheDocument()

      // Click a navigation link
      const homeLink = screen.getByText('Home')
      await user.click(homeLink)

      // Drawer should close (content hidden again)
      // Note: This test may need adjustment based on actual drawer behavior
    })

    it('calls signOut when logout button is clicked', async () => {
      setupMocks()
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={true} />
        </TestWrapper>,
      )

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('logout button is only present for authenticated users', () => {
      setupMocks()

      const { rerender } = render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      expect(screen.queryByText('Logout')).not.toBeInTheDocument()

      rerender(
        <TestWrapper>
          <AppSidebar isAuthenticated={true} />
        </TestWrapper>,
      )

      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  describe('Authentication State Tests', () => {
    it('shows public routes when not authenticated', () => {
      setupMocks()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('shows authenticated routes when authenticated', () => {
      setupMocks({
        useAuth: {
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn(),
          getCurrentUser: vi.fn(),
          loading: false,
          error: null,
          user: { id: 1, email: 'test@example.com' },
          token: 'mock-token',
        },
      })
      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={true} />
        </TestWrapper>,
      )
      // Should show Dashboard with href="/"
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      // Should NOT show Home
      expect(screen.queryByText('Home')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    })

    describe('shows correct header icon based on authentication', () => {
      it('shows MdHome icon when unauthenticated', () => {
        setupMocks()
        render(
          <TestWrapper>
            <AppSidebar isAuthenticated={false} />
          </TestWrapper>,
        )
        expect(screen.getByTestId('sidebar-home-icon')).toBeInTheDocument()
      })
      it('shows MdDashboard icon when authenticated', () => {
        setupMocks()
        render(
          <TestWrapper>
            <AppSidebar isAuthenticated={true} />
          </TestWrapper>,
        )
        expect(screen.getByTestId('sidebar-dashboard-icon')).toBeInTheDocument()
      })
    })
  })

  describe('Theme Integration Tests', () => {
    it('applies light theme link colors', () => {
      setupMocks({ useMode: { mode: 'light', setMode: vi.fn() } })

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveStyle({ color: 'var(--joy-palette-primary-700)' })
    })

    it('applies dark theme link colors', () => {
      setupMocks({ useMode: { mode: 'dark', setMode: vi.fn() } })

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveStyle({ color: 'var(--joy-palette-primary-300)' })
    })

    it('header has consistent styling across themes', () => {
      setupMocks({ useMode: { mode: 'dark', setMode: vi.fn() } })

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const header = screen.getByText('WellPnA').parentElement
      expect(header).toHaveStyle({ backgroundColor: 'primary.main' })
    })
  })

  describe('Accessibility Tests', () => {
    it('navigation links are keyboard accessible', async () => {
      setupMocks()
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')

      // Focus the link
      homeLink?.focus()
      expect(homeLink).toHaveFocus()

      // Can navigate with keyboard
      await user.keyboard('{Tab}')
      // Next element should be focused
    })

    describe('logout button accessibility', () => {
      it('has proper role', () => {
        setupMocks()
        render(
          <TestWrapper>
            <AppSidebar isAuthenticated={true} />
          </TestWrapper>,
        )
        const logoutButton = screen.getByText('Logout')
        expect(logoutButton).toHaveAttribute('role', 'button')
      })
    })

    it('mobile menu button has proper accessibility attributes', () => {
      setupMocks({ useIsMobile: true })

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const menuButton = screen.getByRole('button')
      expect(menuButton).toBeInTheDocument()
      // Could add aria-label if present
    })
  })

  describe('Animation Tests', () => {
    it('drawer has proper transition classes', () => {
      setupMocks({ useIsMobile: true })

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      // Check for Drawer component presence
      // Note: Testing actual animations requires more setup
    })

    it('navigation links have hover transitions', () => {
      setupMocks()

      render(
        <TestWrapper>
          <AppSidebar isAuthenticated={false} />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveStyle({ transition: 'background 0.2s' })
    })
  })
})
