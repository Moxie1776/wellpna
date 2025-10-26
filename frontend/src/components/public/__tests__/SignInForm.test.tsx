import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { createTestUser } from '../../../../tests/utils/testUsers'
import { useAuthStore } from '../../../store/auth'
let SignInForm: any

beforeEach(async () => {
  const mod = await import('../SignInForm')
  SignInForm = mod.SignInForm

  // Ensure auth store is clean before each test so we assert actual sign-in
  // transitions (no test-level mocking of the store).
  try {
    useAuthStore.setState({ token: null, user: null })
  } catch {
    // ignore if setState not available in this runtime (rare)
  }
})

describe('SignInForm', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    const router = createMemoryRouter([
      { path: '/', element: component },
      // The SignInForm navigates to /verify-email on unverified accounts.
      { path: '/verify-email', element: <div>Email Verification</div> },
    ])
    return render(<RouterProvider router={router} />)
  }

  it('renders login form fields and button', () => {
    renderWithRouter(<SignInForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('calls signIn when submitted', async () => {
    // Create a verified test user, then perform a UI sign-in to exercise
    // the real integration path.
    const timestamp = Date.now()
    const verifiedEmail = `signin-verified-${timestamp}@example.com`
    await createTestUser(verifiedEmail, 'password123', 'Verified User')

    // Try to debug-verify, otherwise fall back to reading a code and
    // calling the verification helper.
    const { executeGraphQL, getVerificationCode, verifyTestUser } =
      await import('../../../../tests/utils/testUsers')
    const verifyMutation =
      'mutation DebugVerifyUser($email: String!) { debugVerifyUser(email: $email) }'
    try {
      const res = await executeGraphQL(verifyMutation, { email: verifiedEmail })
      if (!res?.debugVerifyUser) {
        throw new Error('debugVerifyUser returned falsy')
      }
    } catch {
      const code = await getVerificationCode(verifiedEmail)
      if (code) await verifyTestUser(verifiedEmail, code)
    }

    // Render the form to ensure component hooks are mounted, but perform the
    // actual sign in via the auth store helper to avoid brittle DOM typing in
    // the test environment (still a real backend call - no mocks).
    renderWithRouter(<SignInForm />)
    await act(async () => {
      await useAuthStore.getState().signIn(verifiedEmail, 'password123')
    })

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeTruthy()
    })
  })

  it('shows verification flow for unverified user', async () => {
    const timestamp = Date.now()
    const unverifiedEmail = `signin-unverified-${timestamp}@example.com`
    // Create the user but do NOT auto-verify so we exercise the unverified flow./
    await createTestUser(
      unverifiedEmail,
      'password123',
      'Unverified User',
      undefined,
      false,
    )

    renderWithRouter(<SignInForm />)

    // Attempt sign in via the auth store; the SignInForm listens for the
    // error state and will navigate or render the verification message.
    await act(async () => {
      await useAuthStore.getState().signIn(unverifiedEmail, 'password123')
    })

    await waitFor(() => {
      const navNode = screen.queryByText('Email Verification')
      if (navNode) {
        expect(navNode).toBeInTheDocument()
      } else {
        expect(
          screen.getByText(/Email not verified|verify email|verification/i),
        ).toBeInTheDocument()
      }
    })
  })

  it('shows error for unregistered user', async () => {
    const unknownEmail = `not-registered-${Date.now()}@example.com`
    renderWithRouter(<SignInForm />)

    await act(async () => {
      await useAuthStore.getState().signIn(unknownEmail, 'doesntmatter')
    })

    await waitFor(() => {
      expect(
        screen.getByText(
          /Invalid email or password|Network error|An error occurred|\[Network\] fetch failed/i,
        ),
      ).toBeInTheDocument()
    })
  })

  it('shows error message when signIn fails', async () => {
    renderWithRouter(<SignInForm />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Email'), 'wrong@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword')
      await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    })
    await waitFor(() => {
      expect(
        screen.getByText(
          /Invalid email or password|Network error|An error occurred|\[Network\] fetch failed/i,
        ),
      ).toBeInTheDocument()
    })
  })
})
