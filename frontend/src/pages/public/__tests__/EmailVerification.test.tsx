import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider } from '../../../providers/SnackbarProvider'
import { ThemeProvider } from '../../../providers/ThemeProvider'
import EmailVerificationPage from '../EmailVerification'

describe('EmailVerificationPage Component', () => {
  it('renders the email verification form', () => {
    const router = createMemoryRouter([
      {
        path: '/email-verification',
        element: (
          <ThemeProvider>
            <SnackbarProvider>
              <EmailVerificationPage />
            </SnackbarProvider>
          </ThemeProvider>
        ),
      },
    ], {
      initialEntries: ['/email-verification'],
    })

    render(<RouterProvider router={router} />)

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
