import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Breadcrumbs } from '../Breadcrumbs'

// Mock react-router-dom hooks
const mockUseLocation = vi.fn()
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useLocation: () => mockUseLocation(),
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

// Test wrapper component with MemoryRouter
const TestWrapper = ({
  children,
  initialEntries = ['/'],
}: {
  children: React.ReactNode
  initialEntries?: string[]
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering Tests', () => {
    it('renders breadcrumbs with correct structure', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Check that breadcrumbs container is rendered
      const breadcrumbs = screen.getByRole('navigation')
      expect(breadcrumbs).toBeInTheDocument()

      // Check breadcrumb items
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('renders separator between breadcrumb items', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Check for separator text
      const separators = screen.getAllByText('/')
      expect(separators).toHaveLength(2) // Two separators for three items
    })

    it('applies correct styling to breadcrumb container', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const breadcrumbs = screen.getByRole('navigation')
      expect(breadcrumbs).toHaveStyle({
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: '8px',
      })
    })

    it('renders last breadcrumb as active (span) with bold font', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users/profile' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const activeCrumb = screen.getByText('Profile')
      expect(activeCrumb.tagName).toBe('SPAN')
      expect(activeCrumb).toHaveStyle({ fontWeight: 600 })
    })

    it('renders non-active breadcrumbs as links with correct styling', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')
      const dashboardLink = screen.getByText('Dashboard').closest('a')

      expect(homeLink).toBeInTheDocument()
      expect(dashboardLink).toBeInTheDocument()

      expect(homeLink).toHaveAttribute('href', '/')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')

      expect(homeLink).toHaveStyle({
        color: '#1976d2',
        textDecoration: 'none',
        fontWeight: 500,
      })
    })
  })

  describe('Navigation Tests', () => {
    it('renders breadcrumb links with correct href attributes', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/dashboard/users/profile/settings',
      })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
      expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute(
        'href',
        '/dashboard',
      )
      expect(screen.getByText('Users').closest('a')).toHaveAttribute(
        'href',
        '/dashboard/users',
      )
      expect(screen.getByText('Profile').closest('a')).toHaveAttribute(
        'href',
        '/dashboard/users/profile',
      )
    })

    it('renders only active breadcrumb (last item) as non-link', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users/profile' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Links should be present for Home, Dashboard, Users
      expect(screen.getByText('Home').closest('a')).toBeInTheDocument()
      expect(screen.getByText('Dashboard').closest('a')).toBeInTheDocument()
      expect(screen.getByText('Users').closest('a')).toBeInTheDocument()

      // Profile should be a span (active)
      const profileElement = screen.getByText('Profile')
      expect(profileElement.tagName).toBe('SPAN')
      expect(profileElement.closest('a')).not.toBeInTheDocument()
    })

    it('maintains navigation hierarchy in link paths', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/123/edit' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
      expect(screen.getByText('Admin').closest('a')).toHaveAttribute(
        'href',
        '/admin',
      )
      expect(screen.getByText('Users').closest('a')).toHaveAttribute(
        'href',
        '/admin/users',
      )
      expect(screen.getByText('123').closest('a')).toHaveAttribute(
        'href',
        '/admin/users/123',
      )
    })
  })

  describe('Path Parsing Tests', () => {
    it('parses simple path with two segments', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/analytics' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('parses deep nested path with multiple segments', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/admin/users/roles/permissions/edit',
      })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Roles')).toBeInTheDocument()
      expect(screen.getByText('Permissions')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    it('capitalizes first letter of each path segment', () => {
      mockUseLocation.mockReturnValue({
        pathname: '/user-profile/settings/advanced',
      })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('User-profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Advanced')).toBeInTheDocument()
    })

    it('handles paths with numbers and special characters', () => {
      mockUseLocation.mockReturnValue({ pathname: '/project/123/edit-v2' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Project')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
      expect(screen.getByText('Edit-v2')).toBeInTheDocument()
    })

    it('handles paths with underscores and hyphens', () => {
      mockUseLocation.mockReturnValue({ pathname: '/user_admin/data-export' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('User_admin')).toBeInTheDocument()
      expect(screen.getByText('Data-export')).toBeInTheDocument()
    })
  })

  describe('Home Link Tests', () => {
    it('always renders Home as first breadcrumb', () => {
      mockUseLocation.mockReturnValue({ pathname: '/any/path/here' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const breadcrumbs = screen.getAllByText(/Home|./)
      expect(breadcrumbs[0]).toHaveTextContent('Home')
    })

    it('Home link always points to root path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/deep/nested/path' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('Home is rendered as link when not on root path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const homeElement = screen.getByText('Home')
      expect(homeElement.closest('a')).toBeInTheDocument()
      expect(homeElement.tagName).not.toBe('SPAN')
    })
  })

  describe('Theme Integration Tests', () => {
    it('integrates with MUI Joy theme system', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // BreadcrumbsJoy component should be rendered with proper props
      const breadcrumbs = screen.getByRole('navigation')
      expect(breadcrumbs).toHaveClass('MuiBreadcrumbs-root')
    })

    it('applies consistent spacing with theme', () => {
      mockUseLocation.mockReturnValue({ pathname: '/test' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const breadcrumbs = screen.getByRole('navigation')
      expect(breadcrumbs).toHaveStyle({
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: '8px',
      })
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper ARIA role for navigation', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const breadcrumbs = screen.getByRole('navigation')
      expect(breadcrumbs).toBeInTheDocument()
    })

    it('breadcrumb links are keyboard accessible', async () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users' })
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')

      // Focus the link
      homeLink?.focus()
      expect(homeLink).toHaveFocus()

      // Can navigate with keyboard
      await user.keyboard('{Tab}')
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveFocus()
    })

    it('active breadcrumb is not a link (accessibility best practice)', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users/profile' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const activeCrumb = screen.getByText('Profile')
      expect(activeCrumb.tagName).toBe('SPAN')
      expect(activeCrumb.closest('a')).not.toBeInTheDocument()
    })

    it('provides clear visual hierarchy for screen readers', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Links have proper styling for visual hierarchy
      const homeLink = screen.getByText('Home').closest('a')
      const dashboardLink = screen.getByText('Dashboard').closest('a')

      expect(homeLink).toHaveStyle({ fontWeight: 500 })
      expect(dashboardLink).toHaveStyle({ fontWeight: 500 })
    })
  })

  describe('Edge Cases Tests', () => {
    it('handles root path (/) correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Only Home should be rendered, and it should be active (span)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Home').tagName).toBe('SPAN')

      // No other breadcrumbs
      expect(screen.queryByText('/')).toBeNull()
    })

    it('handles single-level path correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()

      // Home should be a link, Dashboard should be active span
      expect(screen.getByText('Home').closest('a')).toBeInTheDocument()
      expect(screen.getByText('Dashboard').tagName).toBe('SPAN')
    })

    it('handles paths with trailing slash', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Dashboard').tagName).toBe('SPAN')
    })

    it('handles empty pathname gracefully', () => {
      mockUseLocation.mockReturnValue({ pathname: '' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Should default to showing only Home
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Home').tagName).toBe('SPAN')
    })

    it('handles pathname with only slashes', () => {
      mockUseLocation.mockReturnValue({ pathname: '///' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Should show only Home as empty segments are filtered
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Home').tagName).toBe('SPAN')
    })
  })

  describe('Interactive Tests', () => {
    it('breadcrumb links are clickable', async () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users/profile' })
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      const usersLink = screen.getByText('Users').closest('a')

      expect(homeLink).toBeInTheDocument()
      expect(dashboardLink).toBeInTheDocument()
      expect(usersLink).toBeInTheDocument()

      // Links should be clickable (basic interaction test)
      await user.click(homeLink!)
      await user.click(dashboardLink!)
      await user.click(usersLink!)
    })

    it('active breadcrumb is not clickable', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const activeCrumb = screen.getByText('Users')
      expect(activeCrumb.closest('a')).not.toBeInTheDocument()
      expect(activeCrumb.tagName).toBe('SPAN')
    })

    it('maintains proper navigation flow when clicking links', () => {
      mockUseLocation.mockReturnValue({ pathname: '/admin/users/roles' })

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      // Verify href attributes allow proper navigation hierarchy
      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
      expect(screen.getByText('Admin').closest('a')).toHaveAttribute(
        'href',
        '/admin',
      )
      expect(screen.getByText('Users').closest('a')).toHaveAttribute(
        'href',
        '/admin/users',
      )
    })

    it('handles rapid clicking of breadcrumb links', async () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard/users/profile' })
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <Breadcrumbs />
        </TestWrapper>,
      )

      const homeLink = screen.getByText('Home').closest('a')!

      // Rapid clicking should not cause issues
      await user.click(homeLink)
      await user.click(homeLink)
      await user.click(homeLink)
    })
  })
})
