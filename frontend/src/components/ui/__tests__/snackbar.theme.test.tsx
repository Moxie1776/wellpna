import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Theme Integration Tests', () => {
  it('applies MUI theme classes', () => {
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'Theme test', color: 'primary' })
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
    expect(snackbar).toHaveAttribute('data-variant', 'filled')
  })

  describe('color variants', () => {
    const colors = [
      'primary',
      'primary.main',
      'error',
      'error.main',
      'warning',
      'warning.main',
      'neutral',
      'neutral.main',
      'success',
      'success.main',
      'info',
      'info.main',
      'secondary',
      'secondary.main',
    ]

    colors.forEach((color) => {
      it(`supports ${color} color variant`, () => {
        const TestWithSnackbar = () => {
          const { showSnackbar } = useSnackbar()
          React.useEffect(() => {
            showSnackbar({ message: `${color} variant`, color: color as any })
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [])
          return null
        }
        const { unmount } = render(
          <SnackbarProvider>
            <TestWithSnackbar />
          </SnackbarProvider>,
        )
        const snackbar = screen.getByTestId('snackbar')
        expect(snackbar).toHaveAttribute('data-color', color)
        unmount()
      })
    })
  })

  it('maintains consistent styling with theme', () => {
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        // provider now enforces a standard duration (10000ms) for all
        // notifications; tests should reflect that behavior instead of
        // relying on passed durations.
        showSnackbar({
          message: 'Consistent theme',
          color: 'primary',
          autoHideDuration: 500,
        })
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
    expect(snackbar).toHaveAttribute('data-variant', 'filled')
    // when running tests, provider uses a shorter standard duration (1000ms)
    expect(snackbar).toHaveAttribute('data-autohideduration', '1000')
  })
})
