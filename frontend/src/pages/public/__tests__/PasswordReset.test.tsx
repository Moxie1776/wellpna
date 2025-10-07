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
            requestPasswordReset: true,
            resetPassword: { token: 'mock-token' },
          },
        }),
      ),
    })),
  },
}))

import '@testing-library/jest-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { useSnackbar } from '@/components/ui/snackbar'

import PasswordResetPage from '../PasswordReset'

jest.mock('@/graphql/mutations/requestPasswordResetMutation', () => ({
  REQUEST_PASSWORD_RESET_MUTATION: 'mock-request-mutation',
}))

jest.mock('@/graphql/mutations/resetPasswordMutation', () => ({
  RESET_PASSWORD_MUTATION: 'mock-reset-mutation',
}))

// Mock PasswordResetForm component to spy on props passed down and simulate interaction triggers
jest.mock('@/components/public/PasswordResetForm', () => ({
  PasswordResetForm: jest.fn(),
}))

const mockShowSnackbar = jest.fn()

const renderWithRouter = (initialEntries: string[]) => {
  const router = createMemoryRouter(
    [
      {
        path: '/password-reset',
        element: <PasswordResetPage />,
      },
    ],
    { initialEntries },
  )
  return render(<RouterProvider router={router} />)
}

describe('PasswordResetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock hooks implementation
    ;(useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    })

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
    renderWithRouter(['/password-reset?email=default@test.com'])
    expect(
      screen.getByTestId('password-reset-form-request'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('default-email')).toHaveTextContent(
      'default@test.com',
    )
  })

  it('renders in request mode with empty default email if not provided', () => {
    renderWithRouter(['/password-reset'])
    expect(
      screen.getByTestId('password-reset-form-request'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('default-email')).toHaveTextContent('')
  })

  it('renders in reset mode when code is present in search params', () => {
    renderWithRouter(['/password-reset?code=xyz&email=user@test.com'])
    expect(screen.getByTestId('password-reset-form-reset')).toBeInTheDocument()
  })

  it('handles successful request reset callback', async () => {
    renderWithRouter(['/password-reset'])

    // Simulate form submitting request reset
    await userEvent.click(screen.getByTestId('request-submit-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Reset code sent!',
        color: 'success',
      })
    })
  })

  it('handles successful password reset callback', async () => {
    renderWithRouter(['/password-reset?code=xyz'])

    // Simulate form submitting password reset
    await userEvent.click(screen.getByTestId('reset-submit-button'))

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        message: 'Password reset successful!',
        color: 'success',
      })
    })
  })
})
