import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import * as React from 'react'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Theme Integration Tests', () => {
  it('applies Joy UI theme classes', () => {
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
    expect(snackbar).toHaveAttribute('data-variant', 'soft')
  })

  describe('color variants', () => {
    const colors: import('../snackbar').SnackbarColor[] = [
      'primary',
      'primary.main',
      'danger',
      'danger.main',
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
            showSnackbar({ message: `${color} variant`, color })
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
    expect(snackbar).toHaveAttribute('data-variant', 'soft')
    expect(snackbar).toHaveAttribute('data-autohideduration', '500')
  })
})
