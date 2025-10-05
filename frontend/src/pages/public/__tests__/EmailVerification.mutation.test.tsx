import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'

import { SnackbarProvider } from '@/components/ui/snackbar'

import EmailVerificationPage from '../EmailVerification'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('EmailVerificationPage - Mutation', () => {
  it('submits form with valid email and code successfully', async () => {
    // ...mock mutation setup...
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    const emailInput = screen.getByLabelText('Email')
    const codeInput = screen.getByLabelText('Verification Code')
    const submitButton = screen.getByRole('button', { name: 'Verify Email' })
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.clear(codeInput)
    await userEvent.type(codeInput, '123456')
    await userEvent.click(submitButton)
    // ...assert mutation called...
  })
})
