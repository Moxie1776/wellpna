import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ThemeProvider } from '../../../providers/ThemeProvider'
import { Dashboard } from '../Dashboard'

describe('Dashboard Component', () => {
  it('renders the dashboard with correct content', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/dashboard',
          element: (
            <ThemeProvider>
              <Dashboard />
            </ThemeProvider>
          ),
        },
      ],
      {
        initialEntries: ['/dashboard'],
      },
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Welcome to the WellPNA Dashboard'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })
})
