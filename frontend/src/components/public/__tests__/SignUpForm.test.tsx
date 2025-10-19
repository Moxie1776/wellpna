import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createTestUser,
  enqueueCleanup,
} from '../../../../tests/utils/testUsers'
import { SignUpForm } from '../SignUpForm'

// Mock localStorage for auth store persistence
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

const mockOnSignup = vi.fn()
let testUserEmail: string

beforeEach(() => {
  // Inject localStorageMock before each test
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Reset localStorageMock state
  localStorageMock.getItem.mockReset()
  localStorageMock.setItem.mockReset()
  localStorageMock.removeItem.mockReset()

  // Reset mock
  mockOnSignup.mockReset()

  // Generate unique email for this test
  testUserEmail = `signup-test-${Date.now()}@example.com`
})

afterEach(() => {
  vi.clearAllMocks()
  try {
    enqueueCleanup('@example.com')
  } catch {
    // ignore
  }
})

describe('SignUpForm', () => {
  it('renders form fields and button', () => {
    render(<SignUpForm onSignup={mockOnSignup} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('calls signUp when submitted', async () => {
    // Use a valid password according to passwordSchema
    const validPassword = 'Password123!'
    render(<SignUpForm onSignup={mockOnSignup} />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test User')
      await userEvent.type(screen.getByLabelText('Email'), testUserEmail)
      await userEvent.type(
        screen.getByLabelText('Phone Number'),
        '555-123-4567',
      )
      await userEvent.type(screen.getByLabelText('Password'), validPassword)
      await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    })
    await waitFor(
      () => {
        expect(mockOnSignup).toHaveBeenCalled()
      },
      { timeout: 5000 },
    )
    // Ensure form is not disabled after successful submission
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).not.toBeDisabled()
      expect(screen.getByLabelText('Email')).not.toBeDisabled()
      expect(screen.getByLabelText('Phone Number')).not.toBeDisabled()
      expect(screen.getByLabelText('Password')).not.toBeDisabled()
      expect(screen.getByRole('button', { name: 'Sign Up' })).not.toBeDisabled()
    })
  })

  it('shows error message when signUp fails', async () => {
    const validPassword = 'Password123!'

    // First create a user
    const existingEmail = `existing-${Date.now()}@example.com`
    await createTestUser(existingEmail, validPassword, 'Existing User')

    render(<SignUpForm onSignup={mockOnSignup} />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test User')
      await userEvent.type(screen.getByLabelText('Email'), existingEmail)
      await userEvent.type(
        screen.getByLabelText('Phone Number'),
        '555-123-4567',
      )
      await userEvent.type(screen.getByLabelText('Password'), validPassword)
      await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    })
    await waitFor(() => {
      expect(
        screen.getByText(
          /User with this email already exists|Network error|An error occurred/i,
        ),
      ).toBeInTheDocument()
    })
  })
})
