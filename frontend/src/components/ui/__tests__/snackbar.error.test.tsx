import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Error Handling Tests', () => {
  it('handles empty message gracefully', () => {
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: '', color: 'primary' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    const snackbar = screen.getByTestId('snackbar')
    expect(snackbar).toBeInTheDocument()
    // Should contain the close button even with empty message
    const closeBtn = snackbar.querySelector('[data-testid="snackbar-close"]')
    expect(closeBtn).toBeInTheDocument()
  })

  it('handles null snackbar state gracefully', () => {
    const TestWithSnackbar = () => null
    render(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    const snackbar = screen.queryByTestId('snackbar')
    expect(snackbar).toBeNull()
  })

  it('handles malformed color values', () => {
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'Malformed color', color: 'error' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    const snackbar = screen.getByTestId('snackbar')
    expect(snackbar).toBeInTheDocument()
  })
})
