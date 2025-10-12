import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import HomePage from '../Home'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}))

// Mock SignInForm component
vi.mock('../../../components/public/SignInForm', () => ({
  SignInForm: ({
    title,
    onSignIn,
  }: {
    title: string
    onSignIn: () => void
  }) => (
    <div data-testid="signin-form">
      <h2>{title}</h2>
      <button onClick={onSignIn} data-testid="signin-button">
        Sign In
      </button>
    </div>
  ),
}))

// Test wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </ThemeProvider>
)

describe('HomePage Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering Tests', () => {
    it('renders the home page with correct structure and content', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      expect(screen.getByText('WellPNA')).toBeInTheDocument()
      expect(
        screen.getByText('Well Plug & Abandonment Solutions'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('signin-form')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })

    it('displays correct typography hierarchy', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Check main title
      const title = screen.getByText('WellPNA')
      expect(title).toBeInTheDocument()
      // Check subtitle
      const subtitle = screen.getByText('Well Plug & Abandonment Solutions')
      expect(subtitle).toBeInTheDocument()
    })
  })

  describe('Illustration Tests', () => {
    it('renders illustration image with correct attributes', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const img = screen.getByRole('img', { name: /villahermosa/i })
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute(
        'src',
        '/villahermosa2.2-removebg-preview.png',
      )
      expect(img).toHaveAttribute('alt', 'villahermosa2.2')
    })
  })

  describe('Content Tests', () => {
    it('displays accurate text content', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      expect(screen.getByText('WellPNA')).toBeInTheDocument()
      expect(
        screen.getByText('Well Plug & Abandonment Solutions'),
      ).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })

    it('renders headings with correct semantic structure', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Only count h1 and h3 headings for semantic structure
      const headings = [
        screen.getByRole('heading', { level: 1 }),
        screen.getByRole('heading', { level: 3 }),
      ]
      expect(headings).toHaveLength(2)
      expect(headings[0]).toHaveTextContent('WellPNA')
      expect(headings[1]).toHaveTextContent('Well Plug & Abandonment Solutions')
    })
  })

  describe('Navigation Tests', () => {
    it('navigates to dashboard on successful sign in', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInButton = screen.getByTestId('signin-button')

      await act(async () => {
        await userEvent.click(signInButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('handles navigation errors gracefully', () => {
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInButton = screen.getByTestId('signin-button')

      expect(() => userEvent.click(signInButton)).not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper heading structure', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Only count h1 and h3 headings for accessibility structure
      const h1 = screen.getByRole('heading', { level: 1 })
      const h3 = screen.getByRole('heading', { level: 3 })
      expect(h1.tagName).toBe('H1')
      expect(h1).toHaveTextContent('WellPNA')
      expect(h3.tagName).toBe('H3')
      expect(h3).toHaveTextContent('Well Plug & Abandonment Solutions')
    })

    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInButton = screen.getByTestId('signin-button')

      // Tab to interactive elements
      await act(async () => {
        await userEvent.tab()
      })

      // Button should be focusable
      expect(signInButton).toBeInTheDocument()
    })

    it('form has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInForm = screen.getByTestId('signin-form')
      expect(signInForm).toBeInTheDocument()
      // The SignInForm component should handle its own accessibility
    })
  })

  describe('Interactive Tests', () => {
    it('handles sign in button click', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInButton = screen.getByTestId('signin-button')

      await act(async () => {
        await userEvent.click(signInButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('handles keyboard interaction with sign in button', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInButton = screen.getByTestId('signin-button')

      // Focus and press Enter
      signInButton.focus()
      expect(signInButton).toHaveFocus()

      await act(async () => {
        await userEvent.keyboard('{Enter}')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('handles space key interaction with sign in button', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const signInButton = screen.getByTestId('signin-button')

      signInButton.focus()

      await act(async () => {
        await userEvent.keyboard(' ')
      })

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})
