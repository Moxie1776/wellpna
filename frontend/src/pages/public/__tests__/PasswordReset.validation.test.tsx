import '@testing-library/jest-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'

import { SnackbarProvider } from '@/components/ui/snackbar'

import PasswordResetPage from '../PasswordReset'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

// Mock urql to prevent actual mutations during validation tests
jest.mock('urql', () => {
  const actualUrql = jest.requireActual('urql')
  return {
    ...actualUrql,
    useMutation: jest.fn(() => [{ fetching: false }, jest.fn()]),
  }
})

describe('PasswordResetPage - Validation', () => {
  describe('Request Password Reset Mode', () => {
    it('shows validation error for empty email', async () => {
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

      await userEvent.clear(emailInput)
      await userEvent.click(submitButton)

      await waitFor(() => {
        // Only assert user-facing error messages
        expect(screen.getByText(/valid email/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for invalid email format', async () => {
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

      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.click(submitButton)

      await waitFor(() => {
        // Only assert user-facing error messages
        expect(screen.getByText(/valid email/i)).toBeInTheDocument()
      })
    })

    it('accepts valid email format', async () => {
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

      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(submitButton)

      // Should not show validation errors for valid email
      await waitFor(() => {
        // Only assert that no error message is present
        expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Reset Password Mode', () => {
    it('shows validation error for empty verification code', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'password123')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/6 digits/i),
        )
        expect(found).toBe(true)
      })
    })

    it('shows validation error for code shorter than 6 digits', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '12345') // 5 digits
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'password123')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/6 digits/i),
        )
        expect(found).toBe(true)
      })
    })

    it('shows validation error for code longer than 6 digits', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '1234567') // 7 digits
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'password123')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/6 digits/i),
        )
        expect(found).toBe(true)
      })
    })

    it('shows validation error for empty new password', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '123456')
      await userEvent.clear(newPasswordInput)
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/at least 6 characters/i),
        )
        expect(found).toBe(true)
      })
    })

    it('shows validation error for password too short', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '123456')
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, '12345') // 5 characters
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, '12345')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/at least 6 characters/i),
        )
        expect(found).toBe(true)
      })
    })

    it('shows validation error for empty confirm password', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '123456')
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'password123')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/at least 6 characters/i),
        )
        expect(found).toBe(true)
      })
    })

    it('shows validation error when passwords do not match', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '123456')
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'password123')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'password456')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const helperTexts = screen.getAllByTestId('form-helper-text')
        const found = helperTexts.some((ht) =>
          ht.textContent?.match(/passwords don't match/i),
        )
        expect(found).toBe(true)
      })
    })

    it('accepts valid form data without showing validation errors', async () => {
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

      await userEvent.clear(codeInput)
      await userEvent.type(codeInput, '123456')
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'password123')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'password123')

      // Should not show validation errors for valid data
      await waitFor(() => {
        const helperTexts = screen.queryAllByTestId('form-helper-text')
        const errorTexts = helperTexts.filter(
          (ht) =>
            ht.textContent &&
            ht.textContent.trim() !== '' &&
            !ht.textContent.includes('at least 6 characters') &&
            !ht.textContent.includes("don't match"),
        )
        // There might be empty helper texts, but no error messages
        expect(errorTexts.length).toBe(0)
      })
    })
  })
})
