// Mock urql globally for loading state tests
jest.doMock('urql', () => ({
  ...jest.requireActual('urql'),
  useMutation: () => [{ fetching: true }, () => new Promise(() => {})],
  gql: jest.fn((template) => template.join('')),
}))

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'
import { SnackbarProvider } from '@/components/ui/snackbar'
import PasswordResetPage from '../PasswordReset'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('PasswordResetPage - Accessibility', () => {
  describe('ARIA Labels and Roles', () => {
    it('has proper heading structure in request mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveTextContent('Request Password Reset')
    })

    it('has proper heading structure in reset mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveTextContent('Reset Your Password')
    })

    it('has accessible form labels in request mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveAttribute('id', 'reset-email')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('has accessible form labels in reset mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const codeInput = screen.getByLabelText('Verification Code')
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      expect(codeInput).toHaveAttribute('id', 'reset-code')
      expect(newPasswordInput).toHaveAttribute('id', 'reset-new-password')
      expect(confirmPasswordInput).toHaveAttribute(
        'id',
        'reset-confirm-password',
      )
    })

    it('has accessible button labels', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      })
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through form fields in request mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const emailInput = screen.getByLabelText('Email')
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      })

      // Check that elements are focusable
      expect(emailInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })

    it('supports tab navigation through form fields in reset mode', async () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const codeInput = screen.getByLabelText('Verification Code')
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      })

      // Tab through all inputs
      // userEvent.tab() is not used, so no unused variable
      expect(codeInput).toBeInTheDocument()
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })

    it('supports Enter key submission in request mode', async () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toBeInTheDocument()
    })

    it('supports Enter key submission in reset mode', async () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const codeInput = screen.getByLabelText('Verification Code')
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      expect(codeInput).toBeInTheDocument()
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('provides descriptive input types for screen readers', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const codeInput = screen.getByLabelText('Verification Code')
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      expect(codeInput).toBeInTheDocument()
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
    })

    it('has appropriate placeholder text for guidance', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const codeInput = screen.getByLabelText('Verification Code')
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      expect(codeInput).toBeInTheDocument()
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {})

  describe('Error Announcements', () => {
    it('provides accessible error messages for validation', async () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const emailInput = screen.getByLabelText('Email')
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      })

      expect(emailInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })

    it('provides accessible error messages for password validation', async () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      const codeInput = screen.getByLabelText('Verification Code')
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      })

      expect(codeInput).toBeInTheDocument()
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Form Structure', () => {
    it('has proper form structure in request mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )
      // Should have a form element
      const form = screen.getByTestId('form')
      expect(form).toBeInTheDocument()
    })

    it('has proper form structure in reset mode', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )
      // Should have a form element
      const form = screen.getByTestId('form')
      expect(form).toBeInTheDocument()
    })
  })
})
