import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'

import { SnackbarProvider } from '@/components/ui/snackbar'
import { ThemeProvider } from '@/providers/ThemeProvider'

import PasswordResetPage from '../PasswordReset'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('PasswordResetPage - Theme Integration', () => {
  const renderWithTheme = (initialEntries?: string[]) => {
    return render(
      <Provider value={mockClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <MemoryRouter initialEntries={initialEntries || ['/']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>,
    )
  }

  describe('Joy UI Theme Classes Applied', () => {
    it('renders Card with Joy UI theme classes in request mode', () => {
      renderWithTheme()

      const card = screen.getByRole('region')
      expect(card).toHaveClass('MuiCard-root') // Joy UI Card class
      expect(card).toHaveAttribute('data-color', 'primary')
      expect(card).toHaveAttribute('data-variant', 'soft')
    })

    it('renders Card with Joy UI theme classes in reset mode', () => {
      renderWithTheme(['/reset-password?token=abc123'])

      const card = screen.getByRole('region')
      expect(card).toHaveClass('MuiCard-root')
      expect(card).toHaveAttribute('data-color', 'primary')
      expect(card).toHaveAttribute('data-variant', 'soft')
    })

    it('renders Typography with Joy UI theme classes', () => {
      renderWithTheme()

      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveClass('MuiTypography-root') // Joy UI Typography class
    })

    it('renders Button with Joy UI theme classes', () => {
      renderWithTheme()

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      })
      expect(submitButton).toHaveClass('MuiButton-root') // Joy UI Button class
    })

    it('renders Input with Joy UI theme classes', () => {
      renderWithTheme()

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveClass('MuiInput-input') // Joy UI Input class
    })
  })

  describe('Form Structure with Theme', () => {
    it('maintains form structure within themed Card', () => {
      renderWithTheme()

      const card = screen.getByRole('region')
      const form = card.querySelector('form')
      expect(form).toBeInTheDocument()

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      })
      expect(form).toContainElement(submitButton)
    })

    it('applies consistent spacing within themed layout', () => {
      renderWithTheme()

      const card = screen.getByRole('region')
      expect(card).toHaveStyle({
        justifyContent: 'center',
        justifyItems: 'center',
      })
    })
  })
})
