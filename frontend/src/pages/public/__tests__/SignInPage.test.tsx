import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import SignInPage from '../SignIn'

describe('SignInPage Component', () => {
  it('renders the SignInForm', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <ThemeProvider>
            <SignInPage />
          </ThemeProvider>
        ),
      },
    ])

    render(<RouterProvider router={router} />)

    // The real SignInForm renders email and password fields and a submit
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })
})
