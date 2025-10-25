import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import SignUpPage from '../SignUp'

describe('SignUpPage Component', () => {
  it('renders the SignUpForm', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <ThemeProvider>
            <SignUpPage />
          </ThemeProvider>
        ),
      },
      { path: '/verify-email', element: <div>Email Verification</div> },
    ])

    render(<RouterProvider router={router} />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })
})
