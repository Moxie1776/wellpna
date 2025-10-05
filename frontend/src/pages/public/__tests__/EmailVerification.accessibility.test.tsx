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

describe('EmailVerificationPage - Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    // ...assert ARIA labels and roles...
  })
  it('supports keyboard navigation', () => {
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    // ...simulate keyboard navigation and assert...
  })
  it('has proper input attributes for screen readers', () => {
    render(
      <Provider value={mockClient}>
        <SnackbarProvider>
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        </SnackbarProvider>
      </Provider>,
    )
    // ...assert input attributes...
  })
})
