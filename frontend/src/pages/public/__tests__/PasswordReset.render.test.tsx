import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SnackbarProvider } from '@/components/ui/snackbar'
import { createClient, Provider } from 'urql'
import PasswordResetPage from '../PasswordReset'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('PasswordResetPage', () => {
  it('renders request password reset mode', () => {
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <PasswordResetPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    expect(screen.getByText('Request Password Reset')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Send Reset Link' }),
    ).toBeInTheDocument()
  })

  it('renders reset password mode when token is present', () => {
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
            <PasswordResetPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Verification Code')).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reset Password' }),
    ).toBeInTheDocument()
  })
})
