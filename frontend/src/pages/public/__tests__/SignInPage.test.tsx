import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import SignInPage from '../Signin'

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock SignInForm component
jest.mock('../../../components/public/SignInForm', () => ({
  SignInForm: ({ onSignIn }: { onSignIn: () => void }) => (
    <div data-testid="signin-form">
      <button onClick={onSignIn} data-testid="signin-button">
        Sign In Mock
      </button>
    </div>
  ),
}))

// Test wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </ThemeProvider>
)

describe('SignInPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the SignInForm', () => {
    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>,
    )

    expect(screen.getByTestId('signin-form')).toBeInTheDocument()
  })

  it('handles navigation on successful sign in', async () => {
    render(
      <TestWrapper>
        <SignInPage />
      </TestWrapper>,
    )

    const signInButton = screen.getByTestId('signin-button')

    await act(async () => {
      await userEvent.click(signInButton)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
