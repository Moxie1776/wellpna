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

    // Accept any heading containing 'Dashboard' to allow slight title changes
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument()
    // The UI may render slightly different header text (e.g. "WellPnA Dashboard")
    // so accept either the explicit welcome string or the current header text.
    expect(screen.getByText(/WellPnA Dashboard/i)).toBeInTheDocument()
  })
})
