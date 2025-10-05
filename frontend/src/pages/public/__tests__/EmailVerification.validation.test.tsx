import '@testing-library/jest-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createClient, Provider } from 'urql'

import { SnackbarProvider } from '@/components/ui/snackbar'

import EmailVerificationPage from '../EmailVerification'

const mockClient = createClient({
  url: 'http://localhost/graphql',
  exchanges: [],
})

describe('EmailVerificationPage - Validation', () => {
  it('shows validation error for invalid email', async () => {
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
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.clear(codeInput)
    await userEvent.type(codeInput, '123456')
    await userEvent.click(submitButton)
    await waitFor(() => {
      const helperTexts = screen.getAllByTestId('form-helper-text')
      const found = helperTexts.some((ht) =>
        ht.textContent?.match(/valid email/i),
      )
      if (!found) {
        // 'Form helper texts:',
        helperTexts.map((ht) => ht.textContent)
      }
      expect(found).toBe(true)
    })
  })

  it('shows validation error for invalid code format', async () => {
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
    await userEvent.type(codeInput, '12345') // 5 digits instead of 6
    await userEvent.click(submitButton)
    await waitFor(() => {
      const helperTexts = screen.getAllByTestId('form-helper-text')
      const found = helperTexts.some((ht) =>
        ht.textContent?.match(/exactly 6 digits/i),
      )
      if (!found) {
        // 'Form helper texts:',
        helperTexts.map((ht) => ht.textContent)
      }
      expect(found).toBe(true)
    })
  })

  it('shows validation error for non-numeric code', async () => {
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
    await userEvent.type(codeInput, 'abcdef') // non-numeric
    await userEvent.click(submitButton)
    await waitFor(() => {
      const helperTexts = screen.getAllByTestId('form-helper-text')
      const found = helperTexts.some((ht) =>
        ht.textContent?.match(/exactly 6 digits/i),
      )
      if (!found) {
        // 'Form helper texts:',
        helperTexts.map((ht) => ht.textContent)
      }
      expect(found).toBe(true)
    })
  })
})
