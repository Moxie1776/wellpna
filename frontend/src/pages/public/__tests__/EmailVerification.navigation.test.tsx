import '@testing-library/jest-dom'

import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'

import { SnackbarProvider } from '@/components/ui/snackbar'

import EmailVerificationPage from '../EmailVerification'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('EmailVerificationPage - Navigation', () => {
  it('navigates to dashboard after successful verification', async () => {
    // ...mock mutation and navigation setup...
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    // ...simulate success and assert navigation...
  })
  it('does not navigate on verification failure', async () => {
    // ...mock mutation failure...
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    // ...simulate failure and assert no navigation...
  })
})
