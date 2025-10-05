import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SnackbarProvider } from '@/components/ui/snackbar'
import { createClient, Provider } from 'urql'
import EmailVerificationPage from '../EmailVerification'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('EmailVerificationPage', () => {
  it('renders email and code fields, verify and resend buttons', () => {
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Verification Code')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Verify Email' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Resend Code' }),
    ).toBeInTheDocument()
  })
})
