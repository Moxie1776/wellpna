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

import * as urql from 'urql'
const useMutationSpy = jest.spyOn(urql, 'useMutation')

// Mock useSnackbar
const mockShowSnackbar = jest.fn()
jest.mock('@/components/ui/snackbar', () => {
  const actual = jest.requireActual('@/components/ui/snackbar')
  return {
    ...actual,
    useSnackbar: () => ({
      showSnackbar: mockShowSnackbar,
    }),
  }
})

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('PasswordResetPage - Navigation', () => {
  let mockResetPasswordMutation: jest.Mock
  let mockRequestResetMutation: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockResetPasswordMutation = jest.fn()
    mockRequestResetMutation = jest.fn()
  })

  describe('Successful Password Reset Navigation', () => {
    beforeEach(() => {
      useMutationSpy.mockReturnValue([
        { fetching: false, stale: false, hasNext: false },
        mockResetPasswordMutation,
      ])
    })

    it('navigates to dashboard after successful password reset', async () => {
      mockResetPasswordMutation.mockResolvedValue({
        data: {
          resetPassword: {
            token: 'new-token',
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
          },
        },
        error: null,
      })

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
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('navigates to dashboard with correct path', async () => {
      mockResetPasswordMutation.mockResolvedValue({
        data: {
          resetPassword: {
            token: 'new-token',
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
          },
        },
        error: null,
      })

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
        expect(mockNavigate).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('does not navigate on failed password reset', async () => {
      mockResetPasswordMutation.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      })

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
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })

    it('does not navigate on network error during password reset', async () => {
      mockResetPasswordMutation.mockRejectedValue(new Error('Network error'))

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
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('Request Mode Navigation', () => {
    beforeEach(() => {
      useMutationSpy.mockReturnValue([
        { fetching: false, stale: false, hasNext: false },
        mockRequestResetMutation,
      ])
    })

    it('does not navigate after successful password reset request', async () => {
      mockRequestResetMutation.mockResolvedValue({
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
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })

    it('stays on same page after password reset request error', async () => {
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
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('URL Parameter Handling', () => {
    it('handles token parameter correctly', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter
              initialEntries={['/reset-password?token=valid-token-123']}
            >
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
      expect(
        screen.queryByText('Request Password Reset'),
      ).not.toBeInTheDocument()
    })

    it('handles empty token parameter', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password?token=']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
    })

    it('handles missing token parameter', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter initialEntries={['/reset-password']}>
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      expect(screen.getByText('Request Password Reset')).toBeInTheDocument()
      expect(screen.queryByText('Reset Your Password')).not.toBeInTheDocument()
    })

    it('handles token with special characters', () => {
      render(
        <Provider value={mockClient}>
          <SnackbarProvider>
            <MemoryRouter
              initialEntries={['/reset-password?token=abc123!@#$%^&*()']}
            >
              <PasswordResetPage />
            </MemoryRouter>
          </SnackbarProvider>
        </Provider>,
      )

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
    })
  })
})
