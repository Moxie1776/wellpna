import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import SignUpPage from '../Signup'

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock SignUpForm component
jest.mock('../../../components/public/SignUpForm', () => ({
  SignUpForm: ({ onSignup }: { onSignup: () => void }) => (
    <div data-testid="signup-form">
      <button onClick={onSignup} data-testid="signup-button">
        Sign Up Mock
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

describe('SignUpPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the SignUpForm', () => {
    render(
      <TestWrapper>
        <SignUpPage />
      </TestWrapper>,
    )

    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
  })

  it('handles navigation on successful sign up', async () => {
    render(
      <TestWrapper>
        <SignUpPage />
      </TestWrapper>,
    )

    const signUpButton = screen.getByTestId('signup-button')

    await act(async () => {
      await userEvent.click(signUpButton)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/verify-email')
  })
})
