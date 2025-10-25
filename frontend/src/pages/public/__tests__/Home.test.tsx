import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import HomePage from '../Home'

describe('HomePage Component', () => {
  it('renders the home page with correct content', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <ThemeProvider>
            <HomePage />
          </ThemeProvider>
        ),
      },
    ], {
      initialEntries: ['/'],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByText('WellPNA')).toBeInTheDocument()
    expect(
      screen.getByText('Well Plug & Abandonment Solutions'),
    ).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })
})
