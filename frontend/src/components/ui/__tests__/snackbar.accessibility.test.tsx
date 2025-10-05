import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import * as React from 'react'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Accessibility Tests', () => {
  it('snackbar has proper ARIA attributes', () => {
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'ARIA test', color: 'primary' })
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    const snackbar = screen.getByTestId('snackbar')
    expect(snackbar).toHaveAttribute('role', 'alert')
    expect(snackbar).toHaveAttribute('aria-live', 'assertive')
  })

  it('close button has proper ARIA label', () => {
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'ARIA label test', color: 'primary' })
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    const closeButton = screen.getByTestId('snackbar-close')
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
  })
})
