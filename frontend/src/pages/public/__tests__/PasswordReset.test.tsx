import '@testing-library/jest-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useSnackbar } from '@/components/ui/snackbar'

import PasswordResetPage from '../PasswordReset'

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}))

jest.mock('@/components/ui/snackbar', () => ({
  useSnackbar: jest.fn(),
}))

// Mock PasswordResetForm component to spy on props passed down and simulate interaction triggers
jest.mock('@/components/public/PasswordResetForm', () => ({
  PasswordResetForm: jest.fn(),
}))

const mockShowSnackbar = jest.fn()
const mockNavigate = jest.fn()
const mockSetSearchParams = jest.fn()

describe('PasswordResetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock hooks implementation
    ;(useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    })
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)

    // Mock PasswordResetForm component implementation
    const { PasswordResetForm } = jest.requireMock(
      '@/components/public/PasswordResetForm',
    )
    PasswordResetForm.mockImplementation(
      ({ mode, defaultEmail, onRequestReset, onResetPassword }: any) => (
        <div data-testid={`password-reset-form-${mode}`}>
          <p data-testid="default-email">{defaultEmail}</p>

          {/* Simulate interaction triggers that call page handlers */}
          {mode === 'request' && (
            <button
              data-testid="request-submit-button"
              onClick={() => onRequestReset({ email: 'test@example.com' })}
            >
              Submit Request
            </button>
          )}

          {mode === 'reset' && (
            <button
              data-testid="reset-submit-button"
              onClick={() =>
                onResetPassword({
                  code: '123456',
                  newPassword: 'NewPass1!',
                  confirmPassword: 'NewPass1!',
                })
              }
            >
              Submit Reset
            </button>
          )}
          {/* Note: No explicit 'resend code' handler is present in PasswordResetPage logic, 
              so testing onRequestReset covers link resending functionality. */}
        </div>
      ),
    )
  })

  it('renders in request mode with default email from search params', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('email=default@test.com'),
      mockSetSearchParams,
    ])
    render(<PasswordResetPage />)
    expect(
      screen.getByTestId('password-reset-form-request'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('default-email')).toHaveTextContent(
      'default@test.com',
    )
  })

  it('renders in request mode with empty default email if not provided', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(''),
      mockSetSearchParams,
    ])
    render(<PasswordResetPage />)
    expect(
      screen.getByTestId('password-reset-form-request'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('default-email')).toHaveTextContent('')
  })

  it('renders in reset mode when token is present in search params', () => {
    ;(useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('token=xyz&email=user@test.com'),
      mockSetSearchParams,
    ])
    render(<PasswordResetPage />)
    expect(screen.getByTestId('password-reset-form-reset')).toBeInTheDocument()
  })

  it('handles successful request reset callback', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(''),
      mockSetSearchParams,
    ])
    render(<PasswordResetPage />)

    // Simulate form submitting request reset
    await userEvent.click(screen.getByTestId('request-submit-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Reset link sent!',
        color: 'success',
      })
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handles successful password reset callback', async () => {
    ;(useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('token=xyz'),
      mockSetSearchParams,
    ])
    render(<PasswordResetPage />)

    // Simulate form submitting password reset
    await userEvent.click(screen.getByTestId('reset-submit-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Password reset successful!',
        color: 'success',
      })
    })
    expect(mockNavigate).toHaveBeenCalledWith('/signin')
  })
})
