jest.mock('@/components/ui/snackbar', () => ({
  useSnackbar: jest.fn(),
}))

jest.mock('@/utils/graphqlClient', () => ({
  __esModule: true,
  default: {
    mutation: jest.fn(() => ({
      toPromise: jest.fn(() =>
        Promise.resolve({
          data: {
            verifyEmail: true,
            sendVerificationEmail: true,
          },
        }),
      ),
    })),
  },
}))

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useSnackbar } from '@/components/ui/snackbar'

import EmailVerificationPage from '../EmailVerification'

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}))

// Mock EmailVerificationForm component to spy on props passed down and simulate interaction triggers
jest.mock('@/components/public/EmailVerificationForm', () => ({
  EmailVerificationForm: jest.fn(),
}))

const mockShowSnackbar = jest.fn()
const mockNavigate = jest.fn()
const mockSetSearchParams = jest.fn()

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock hooks implementation
    ;(useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('email=test@example.com'),
      mockSetSearchParams,
    ])
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)

    // Mock EmailVerificationForm component implementation
    const { EmailVerificationForm } = jest.requireMock(
      '@/components/public/EmailVerificationForm',
    )
    EmailVerificationForm.mockImplementation(
      ({ onVerify, onResendCode, defaultEmail }: any) => (
        <div data-testid="email-verification-form">
          {/* Simulate rendering based on props */}
          <p data-testid="default-email">{defaultEmail}</p>

          {/* Simulate interaction triggers that call page handlers */}
          <button
            data-testid="verify-button"
            onClick={() => onVerify({ email: 'user@test.com', code: '123456' })}
          >
            Trigger Verify
          </button>
          <button
            data-testid="resend-button"
            onClick={() => onResendCode('user@test.com')}
          >
            Trigger Resend
          </button>
          <button
            data-testid="resend-empty-button"
            onClick={() => onResendCode('')}
          >
            Trigger Resend Empty
          </button>
        </div>
      ),
    )
  })

  it('renders the EmailVerificationForm with default email from search params', () => {
    render(<EmailVerificationPage />)
    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument()
    expect(screen.getByTestId('default-email')).toHaveTextContent(
      'test@example.com',
    )
  })

  it('handles successful verification callback', async () => {
    render(<EmailVerificationPage />)

    // Simulate user clicking verify button which calls onVerify prop passed to form
    await userEvent.click(screen.getByTestId('verify-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Email verified!',
        color: 'success',
      })
    })
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('handles resend code callback when email is provided', async () => {
    render(<EmailVerificationPage />)

    // Simulate user clicking resend button which calls onResendCode prop passed to form
    await userEvent.click(screen.getByTestId('resend-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Verification code sent to your email',
        color: 'primary',
      })
    })
    // Should not navigate on resend success
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handles resend code callback when email is empty', async () => {
    render(<EmailVerificationPage />)

    // Simulate user clicking resend empty button which calls onResendCode prop passed to form with empty string
    await userEvent.click(screen.getByTestId('resend-empty-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Please enter your email',
        color: 'warning',
      })
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
