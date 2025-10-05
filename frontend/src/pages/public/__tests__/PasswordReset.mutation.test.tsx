import '@testing-library/jest-dom'

import { act, render, screen, waitFor } from '@testing-library/react'
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

// Mock useSnackbar only, re-export real SnackbarProvider
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

// ...existing code...

let mockRequestResetMutation: jest.Mock
let mockResetPasswordMutation: jest.Mock

describe('PasswordResetPage - Mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequestResetMutation = jest.fn()
    mockResetPasswordMutation = jest.fn()
    useMutationSpy.mockReturnValue([
      { fetching: false, stale: false, hasNext: false },
      mockRequestResetMutation,
    ])
  })

  it('calls requestPasswordReset mutation with correct email on successful submission', async () => {
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
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRequestResetMutation).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
    })
  })

  it('shows success snackbar on successful request', async () => {
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
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Password reset link sent to your email',
        color: 'primary',
      })
    })
  })

  it('shows error snackbar on mutation error', async () => {
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
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'User not found',
        color: 'danger',
      })
    })
  })

  it('shows generic error snackbar on unknown error', async () => {
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

describe('Reset Password', () => {
  beforeEach(() => {
    useMutationSpy.mockReturnValue([
      { fetching: false, stale: false, hasNext: false },
      mockResetPasswordMutation,
    ])
    // No need to clear gqlSpy
  })

  it('calls resetPassword mutation with correct parameters on successful submission', async () => {
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
      expect(mockResetPasswordMutation).toHaveBeenCalledWith({
        token: 'abc123',
        newPassword: 'newpassword123',
        code: '123456',
        inputMode: 'numeric',
      })
    })
  })

  it('shows success snackbar and navigates to dashboard on successful reset', async () => {
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
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Password reset successfully! You are now logged in.',
        color: 'primary',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error snackbar on mutation error', async () => {
    mockResetPasswordMutation.mockResolvedValue({
      data: null,
      error: { message: 'Invalid or expired reset token' },
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
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Invalid or expired reset token',
        color: 'danger',
      })
    })
  })

  it('shows generic error snackbar on unknown error', async () => {
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
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Network error',
        color: 'danger',
      })
    })
  })
})

describe('Loading States', () => {
  it('disables submit button during request reset loading', async () => {
    let resolveMutation: (value: any) => void
    const mutationPromise = new Promise((resolve) => {
      resolveMutation = resolve
    })

    mockRequestResetMutation.mockReturnValue(mutationPromise)
    useMutationSpy.mockReturnValue([
      { fetching: false, stale: false, hasNext: false },
      mockRequestResetMutation,
    ])

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
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    // After click, button should show loading state and be disabled
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()

    // Resolve the mutation
    act(() => {
      resolveMutation!({
        data: { requestPasswordReset: true },
        error: null,
      })
    })
  })

  it('disables submit button during reset password loading', async () => {
    let resolveMutation: (value: any) => void
    const mutationPromise = new Promise((resolve) => {
      resolveMutation = resolve
    })

    mockResetPasswordMutation.mockReturnValue(mutationPromise)
    useMutationSpy.mockReturnValue([
      { fetching: false, stale: false, hasNext: false },
      mockResetPasswordMutation,
    ])

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
    const submitButton = screen.getByRole('button', { name: 'Reset Password' })
    await userEvent.clear(codeInput)
    await userEvent.type(codeInput, '123456')
    await userEvent.clear(newPasswordInput)
    await userEvent.type(newPasswordInput, 'newpassword123')
    await userEvent.clear(confirmPasswordInput)
    await userEvent.type(confirmPasswordInput, 'newpassword123')
    await userEvent.click(submitButton)

    // After click, button should show loading state and be disabled
    expect(screen.getByRole('button', { name: 'Resetting...' })).toBeDisabled()

    // Resolve the mutation
    act(() => {
      resolveMutation!({
        data: {
          resetPassword: {
            token: 'new-token',
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
          },
        },
        error: null,
      })
    })
  })
})
// ...existing code...
