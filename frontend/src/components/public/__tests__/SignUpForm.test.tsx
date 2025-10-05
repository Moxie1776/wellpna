import '@testing-library/jest-dom'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SignUpForm } from '../../../components/public/SignUpForm'
import { useAuth } from '../../../hooks/useAuth'
import passwordSchema from '../../../utils/passwordSchema'

jest.mock('../../../hooks/useAuth', () => ({ useAuth: jest.fn() }))
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const mockSignUp = jest.fn()
const mockOnSignup = jest.fn()

beforeEach(() => {
  mockSignUp.mockReset()
  mockOnSignup.mockReset()
  mockUseAuth.mockReturnValue({
    signUp: mockSignUp,
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    loading: false,
    error: null,
  } as any)
})

afterEach(() => {
  jest.clearAllMocks()
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
    mockSignUp.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    })
    // Use a valid password according to passwordSchema
    const validPassword = 'Password123!'
    expect(passwordSchema.safeParse(validPassword).success).toBe(true)
    render(<SignUpForm onSignup={mockOnSignup} />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test User')
      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), validPassword)
      await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    })
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        validPassword,
        'Test User',
      )
      expect(mockOnSignup).toHaveBeenCalled()
    })
  })

  it('shows error message when signUp fails', async () => {
    const errorMessage = 'Email already exists'
    mockSignUp.mockRejectedValueOnce(new Error(errorMessage))
    mockUseAuth.mockReturnValue({
      signUp: mockSignUp,
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentUser: jest.fn(),
      loading: false,
      error: errorMessage,
    } as any)
    const validPassword = 'Password123!'
    expect(passwordSchema.safeParse(validPassword).success).toBe(true)
    render(<SignUpForm onSignup={mockOnSignup} />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test User')
      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), validPassword)
      await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    })
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
})
