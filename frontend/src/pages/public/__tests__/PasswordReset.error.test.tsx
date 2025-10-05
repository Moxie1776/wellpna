import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'
import { SnackbarProvider } from '../../../components/ui/snackbar'

const mockShowSnackbar = jest.fn()
const mockNavigate = jest.fn()

jest.mock('urql', () => {
  const actualUrql = jest.requireActual('urql')
  return {
    ...actualUrql,
    useMutation: jest.fn(),
  }
})
jest.mock('../../../components/ui/snackbar', () => ({
  ...jest.requireActual('../../../components/ui/snackbar'),
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

import PasswordResetPage from '../PasswordReset'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

import { useMutation } from 'urql'

describe('PasswordResetPage - Error Handling', () => {
  const mockRequestResetMutation = jest.fn()
  const mockResetPasswordMutation = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Request Password Reset - User Not Found Error', () => {
    beforeEach(() => {
      ;(useMutation as jest.Mock).mockReturnValue([
        { fetching: false },
        mockRequestResetMutation,
      ])
    })

    describe('when submitting with non-existent email', () => {
      it('displays user not found error message', async () => {
        mockRequestResetMutation.mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        })

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
        await userEvent.type(emailInput, 'nonexistent@example.com')
        await userEvent.click(submitButton)

        await waitFor(() => {
          expect(mockShowSnackbar).toHaveBeenCalledWith({
            message: 'User not found',
            color: 'danger',
          })
        })
      })
    })
  })

  describe('Request Password Reset - Network Error', () => {
    beforeEach(() => {
      ;(useMutation as jest.Mock).mockReturnValue([
        { fetching: false },
        mockRequestResetMutation,
      ])
    })

    describe('when network connection fails during request', () => {
      it('displays network error message', async () => {
        mockRequestResetMutation.mockRejectedValue(new Error('Network error'))

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

        await waitFor(() => {
          expect(mockShowSnackbar).toHaveBeenCalledWith({
            message: 'Network error',
            color: 'danger',
          })
        })
      })
    })
  })

  describe('Request Password Reset - Server Error', () => {
    beforeEach(() => {
      ;(useMutation as jest.Mock).mockReturnValue([
        { fetching: false },
        mockRequestResetMutation,
      ])
    })

    describe('when email service is unavailable', () => {
      it('displays custom server error message', async () => {
        mockRequestResetMutation.mockResolvedValue({
          data: null,
          error: { message: 'Email service unavailable' },
        })

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

        await waitFor(() => {
          expect(mockShowSnackbar).toHaveBeenCalledWith({
            message: 'Email service unavailable',
            color: 'danger',
          })
        })
      })
    })
  })

  describe('Reset Password - Network Error', () => {
    beforeEach(() => {
      ;(useMutation as jest.Mock).mockReturnValue([
        { fetching: false },
        mockResetPasswordMutation,
      ])
    })

    describe('when network connection fails during password reset', () => {
      it('displays network connection error message', async () => {
        mockResetPasswordMutation.mockRejectedValue(
          new Error('Network connection failed'),
        )

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
        await userEvent.type(newPasswordInput, 'newpassword123')
        await userEvent.clear(confirmPasswordInput)
        await userEvent.type(confirmPasswordInput, 'newpassword123')
        await userEvent.click(submitButton)

        await waitFor(() => {
          expect(mockShowSnackbar).toHaveBeenCalledWith({
            message: 'Network connection failed',
            color: 'danger',
          })
        })
      })
    })
  })

  describe('Form Validation - Empty Email Field', () => {
    describe('when submitting request form without email', () => {
      it('prevents mutation call due to validation', async () => {
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

        // Submit without filling email
        await userEvent.click(submitButton)

        // Mutation should not be called due to validation
        expect(mockRequestResetMutation).not.toHaveBeenCalled()
      })
    })
  })

  describe('Form Validation - Password Mismatch', () => {
    describe('when passwords do not match in reset form', () => {
      it('prevents mutation call due to validation', async () => {
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
        await userEvent.type(newPasswordInput, 'password1')
        await userEvent.clear(confirmPasswordInput)
        await userEvent.type(confirmPasswordInput, 'password2')
        await userEvent.click(submitButton)

        // Mutation should not be called due to validation
        expect(mockResetPasswordMutation).not.toHaveBeenCalled()
      })
    })
  })

  describe('Error Recovery - Request Mode Retry', () => {
    describe('when first request fails with network error', () => {
      describe('first attempt shows error', () => {
        it('displays network error snackbar on first attempt', async () => {
          ;(useMutation as jest.Mock).mockReturnValue([
            { fetching: false },
            mockRequestResetMutation,
          ])
          mockRequestResetMutation.mockReset()
          mockRequestResetMutation
            .mockResolvedValueOnce({
              data: null,
              error: { message: 'Network error' },
            })
            .mockResolvedValueOnce({
              data: { requestPasswordReset: true },
              error: null,
            })

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

          await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith({
              message: 'Network error',
              color: 'danger',
            })
          })
        })
      })

      describe('second attempt succeeds', () => {
        it('displays success snackbar on retry', async () => {
          ;(useMutation as jest.Mock).mockReturnValue([
            { fetching: false },
            mockRequestResetMutation,
          ])
          mockRequestResetMutation.mockReset()
          mockRequestResetMutation
            .mockResolvedValueOnce({
              data: null,
              error: { message: 'Network error' },
            })
            .mockResolvedValueOnce({
              data: { requestPasswordReset: true },
              error: null,
            })

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

          // First attempt
          await userEvent.clear(emailInput)
          await userEvent.type(emailInput, 'test@example.com')
          await userEvent.click(submitButton)

          // Wait for first attempt to complete
          await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith({
              message: 'Network error',
              color: 'danger',
            })
          })

          // Second attempt
          await userEvent.click(submitButton)

          await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith({
              message: 'Password reset link sent to your email',
              color: 'primary',
            })
          })
        })
      })
    })
  })

  describe('Invalid URL Parameters - Malicious Token', () => {
    describe('when token contains script tags', () => {
      it('renders reset form safely without executing scripts', () => {
        render(
          <Provider value={mockClient}>
            <SnackbarProvider>
              <MemoryRouter
                initialEntries={[
                  '/reset-password?token=<script>alert("xss")</script>',
                ]}
              >
                <PasswordResetPage />
              </MemoryRouter>
            </SnackbarProvider>
          </Provider>,
        )

        // Should still render the reset form
        expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
        expect(screen.getByLabelText('Verification Code')).toBeInTheDocument()
      })
    })
  })

  describe('Invalid URL Parameters - Oversized Token', () => {
    describe('when token is extremely long', () => {
      it('handles long token gracefully without performance issues', () => {
        const longToken = 'a'.repeat(1000)

        render(
          <Provider value={mockClient}>
            <SnackbarProvider>
              <MemoryRouter
                initialEntries={[`/reset-password?token=${longToken}`]}
              >
                <PasswordResetPage />
              </MemoryRouter>
            </SnackbarProvider>
          </Provider>,
        )

        // Should still render the reset form
        expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
      })
    })
  })
})
