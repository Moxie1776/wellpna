import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'

import { SignInForm } from '../../../components/public/SignInForm'
import { useAuth } from '../../../hooks/useAuth'

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }))
const mockUseAuth = useAuth as MockedFunction<typeof useAuth>

const mockSignIn = vi.fn()
const mockOnSignIn = vi.fn()

beforeEach(() => {
  mockSignIn.mockReset()
  mockOnSignIn.mockReset()
  mockUseAuth.mockReturnValue({
    signIn: mockSignIn,
    signOut: vi.fn(),
    signUp: vi.fn(),
    getCurrentUser: vi.fn(),
    loading: false,
    error: null,
  } as any)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('SignInForm', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    const router = createMemoryRouter([
      { path: '/', element: component },
      { path: '/email-verification', element: <div>Email Verification</div> },
    ])
    return render(<RouterProvider router={router} />)
  }

  it('renders login form fields and button', () => {
    renderWithRouter(<SignInForm onSignIn={mockOnSignIn} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('calls signIn when submitted', async () => {
    mockSignIn.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    })
    renderWithRouter(<SignInForm onSignIn={mockOnSignIn} />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password123')
      await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    })
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockOnSignIn).toHaveBeenCalled()
    })
  })

  it('shows error message when signIn fails', async () => {
    const errorMessage = 'Invalid credentials'
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage))
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
      loading: false,
      error: errorMessage,
    } as any)
    renderWithRouter(<SignInForm onSignIn={mockOnSignIn} />)
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword')
      await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    })
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('redirects to email verification page when email is not verified', async () => {
    const errorMessage = 'Email not verified'
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage))
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signOut: vi.fn(),
      signUp: vi.fn(),
      getCurrentUser: vi.fn(),
      loading: false,
      error: errorMessage,
    } as any)

    const router = createMemoryRouter([
      { path: '/', element: <SignInForm onSignIn={mockOnSignIn} /> },
      { path: '/email-verification', element: <div>Email Verification</div> },
    ])

    render(<RouterProvider router={router} />)

    await act(async () => {
      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password123')
      await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/email-verification')
      expect(router.state.location.search).toBe('?email=test%40example.com')
    })
  })
})
