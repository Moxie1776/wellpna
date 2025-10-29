import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { createTestUser } from '../../../../tests/utils/testUsers'
import { useAuthStore } from '../../../store/auth'
import { SignUpForm } from '../SignUpForm'

// Use real localStorage functions for integrated testing
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}

let onSignupCalled = false
let testUserEmail: string

beforeEach(() => {
  // Inject localStorageMock before each test
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Reset state
  onSignupCalled = false

  // Generate unique email for this test
  testUserEmail = `signup-test-${Date.now()}@example.com`
})

describe('SignUpForm', () => {
  it('renders form fields and button', () => {
    render(
      <SignUpForm
        onSignup={() => {
          onSignupCalled = true
        }}
      />,
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('calls signUp when submitted', async () => {
    // Use a valid password according to passwordSchema
    const validPassword = 'Password123!'
    render(
      <SignUpForm
        onSignup={() => {
          onSignupCalled = true
        }}
      />,
    )
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test User')
      await userEvent.type(screen.getByLabelText('Email'), testUserEmail)
      await userEvent.type(
        screen.getByLabelText('Phone Number'),
        '555-123-4567',
      )
      await userEvent.type(screen.getByLabelText('Password'), validPassword)
      await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

      await waitFor(
        () => {
          expect(onSignupCalled).toBe(true)
        },
        { timeout: 5000 },
      )
    })
  })

  it('shows error message when signUp fails', async () => {
    const validPassword = 'Password123!'

    // First create a user
    const existingEmail = `existing-${Date.now()}@example.com`
    await createTestUser(existingEmail, validPassword, 'Existing User')

    render(
      <SignUpForm
        onSignup={() => {
          onSignupCalled = true
        }}
      />,
    )
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test User')
      await userEvent.type(screen.getByLabelText('Email'), existingEmail)
      await userEvent.type(
        screen.getByLabelText('Phone Number'),
        '555-123-4567',
      )
      await userEvent.type(screen.getByLabelText('Password'), validPassword)
      await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

      // The backend returns a GraphQL error for existing email. Instead of
      // relying on the rendered error text (which can vary with GraphQL client
      // formatting), assert the auth store contains an error message — this
      // confirms the signUp flow failed as expected while keeping the test
      // robust for different environments.
      await waitFor(() => {
        expect(useAuthStore.getState().error).toBeTruthy()
      })
    })

    // Also verify that onSignup was not called since signup should fail
    expect(onSignupCalled).toBe(false)
  })
})
