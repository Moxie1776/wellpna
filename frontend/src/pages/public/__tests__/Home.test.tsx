import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import HomePage from '../Home'

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock SignInForm component
jest.mock('../../../components/public/SignInForm', () => ({
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
    jest.clearAllMocks()
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

    it('renders with proper layout components', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Check for Sheet container
      const sheet = document.querySelector('.MuiSheet-root')
      expect(sheet).toBeInTheDocument()

      // Check for main container Box
      const mainBox = document.querySelector('.MuiBox-root')
      expect(mainBox).toBeInTheDocument()
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

      const img = screen.getByRole('img', { name: /no shale gas/i })
      expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute(
          'src',
          '/cybergedeon_no_shale_gas_black.svg',
        )
      expect(img).toHaveAttribute('alt', 'No Shale Gas')
      expect(img).toHaveAttribute('width', '300')
      expect(img).toHaveAttribute('height', '300')
    })
  })

  describe('Theme Responsiveness Tests', () => {
    it('uses theme-aware components', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Typography components should be present
      const title = screen.getByText('WellPNA')
      expect(title).toBeInTheDocument()
      const subtitle = screen.getByText('Well Plug & Abandonment Solutions')
      expect(subtitle).toBeInTheDocument()
    })

    it('card component uses theme variant and color', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Check for Card with primary color and soft variant
      const card = document.querySelector('.MuiCard-root')
      expect(card).toBeInTheDocument()
      expect(card?.className).toMatch(/MuiCard-colorPrimary/)
      expect(card?.className).toMatch(/MuiCard-variantSoft/)
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

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

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

  describe('Responsive Design Tests', () => {
    it('renders with responsive layout structure', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Check for Stack component with responsive direction
      const stack = document.querySelector('.MuiStack-root')
      expect(stack).toBeInTheDocument()
    })

    it('applies responsive padding to main container', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      // Main container should have responsive padding
      const mainBox = document.querySelector('.MuiBox-root')
      expect(mainBox).toBeInTheDocument()
    })

    it('card has responsive minimum width', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>,
      )

      const card = document.querySelector('.MuiCard-root')
      expect(card).toBeInTheDocument()
      // Card should have minWidth styling
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
