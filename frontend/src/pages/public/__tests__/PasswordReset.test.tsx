vi.mock('@/components/ui/snackbar', () => ({
  useSnackbar: vi.fn(),
}))

vi.mock('@/utils/graphqlClient', () => ({
  __esModule: true,
  default: {
    mutation: vi.fn(() => ({
      toPromise: vi.fn(() =>
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

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'

import { useSnackbar } from '@/components/ui/snackbar'

import PasswordResetPage from '../PasswordReset'

vi.mock('@/graphql/mutations/requestPasswordResetMutation', () => ({
  REQUEST_PASSWORD_RESET_MUTATION: 'mock-request-mutation',
}))

vi.mock('@/graphql/mutations/resetPasswordMutation', () => ({
  RESET_PASSWORD_MUTATION: 'mock-reset-mutation',
}))

// Mock PasswordResetForm component to spy on props passed down and simulate interaction triggers
vi.mock('@/components/public/PasswordResetForm', () => ({
  PasswordResetForm: vi.fn(),
}))

import { PasswordResetForm } from '@/components/public/PasswordResetForm'

const mockShowSnackbar = vi.fn()

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
    vi.clearAllMocks()

    // Mock hooks implementation
    ;(useSnackbar as MockedFunction<typeof useSnackbar>).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    })

    // Mock PasswordResetForm component implementation
    ;(PasswordResetForm as any).mockImplementation(
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
