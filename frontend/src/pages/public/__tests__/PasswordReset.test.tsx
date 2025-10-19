import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createTestUser,
  enqueueCleanup,
  executeGraphQL,
} from '../../../../tests/utils/testUsers'
import { SnackbarProvider } from '../../../providers/SnackbarProvider'
import PasswordResetPage from '../PasswordReset'

// Mock the urql client to capture GraphQL calls
vi.mock('@/utils/graphqlClient', () => ({
  default: {
    mutation: vi.fn(),
  },
}))

import client from '@/utils/graphqlClient'

const renderWithRouter = (initialEntries: string[]) => {
  const router = createMemoryRouter(
    [
      {
        path: '/password-reset',
        element: <PasswordResetPage />,
      },
    ],
    {
      initialEntries,
      initialIndex: 0,
    },
  )
  return render(
    <SnackbarProvider>
      <RouterProvider router={router} />
    </SnackbarProvider>,
  )
}

describe('PasswordReset Integration Test', () => {
  let testEmail: string

  beforeEach(async () => {
    testEmail = `test-${Date.now()}@example.com`
    enqueueCleanup(testEmail)
    await createTestUser(testEmail, 'Password1!', 'PW Reset User')
  })

  it('should reset password with real backend', async () => {
    const user = userEvent.setup()

    // Request password reset
    const requestResult = await executeGraphQL(
      `
      mutation RequestPasswordReset($email: String!) {
        requestPasswordReset(email: $email)
      }
    `,
      { email: testEmail },
    )

    expect(requestResult.requestPasswordReset).toBe(true)

    // Get the reset code
    const codeResult = await executeGraphQL(
      `
      query GetPasswordResetCode($email: String!) {
        getPasswordResetCode(email: $email)
      }
    `,
      { email: testEmail },
    )

    const resetCode = codeResult.getPasswordResetCode
    expect(resetCode).toBeTruthy()

    // Mock the urql client mutation to capture calls
    const mockMutation = vi.fn()
    client.mutation = mockMutation

    // Render the page in reset mode with the code
    renderWithRouter([`/password-reset?code=${resetCode}`])

    // Wait for the form to render
    await waitFor(() => {
      expect(screen.getByTestId('reset-submit-button')).toBeInTheDocument()
    })

    // Fill in the form
    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)

    await user.type(passwordInput, 'NewPassword1!')
    await user.type(confirmInput, 'NewPassword1!')

    // Click submit
    const submitButton = screen.getByTestId('reset-submit-button')
    await user.click(submitButton)

    // Check that the mutation was called with the correct variables
    await waitFor(() => {
      expect(mockMutation).toHaveBeenCalledWith(
        expect.any(Object), // GraphQL document
        expect.objectContaining({
          data: expect.objectContaining({
            code: resetCode,
            newPassword: 'NewPassword1!',
          }),
        }),
      )
    })
  })
})
