import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider } from '../../../providers/SnackbarProvider'
import { ThemeProvider } from '../../../providers/ThemeProvider'
import PasswordResetPage from '../PasswordReset'

describe('PasswordResetPage Component', () => {
  it('renders the password reset form', () => {
    const router = createMemoryRouter([
      {
        path: '/password-reset',
        element: (
          <ThemeProvider>
            <SnackbarProvider>
              <PasswordResetPage />
            </SnackbarProvider>
          </ThemeProvider>
        ),
      },
    ], {
      initialEntries: ['/password-reset'],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
  })
})
