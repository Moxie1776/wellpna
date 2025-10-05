import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import * as React from 'react'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Notification Types Tests', () => {
  const scenarios = [
    { color: 'success', expected: 'success' },
    { color: 'neutral', expected: 'neutral' },
    { color: 'warning', expected: 'warning' },
    { color: 'danger', expected: 'danger' },
    { color: 'info', expected: 'info' },
  ]

  scenarios.forEach(({ color, expected }) => {
    it(`renders ${expected} notification with correct color`, () => {
      const TestWithSnackbar = () => {
        const { showSnackbar } = useSnackbar()
        React.useEffect(() => {
          showSnackbar({
            message: `${expected} message`,
            color: color as import('../snackbar').SnackbarColor,
          })
        }, [])
        return null
      }
      render(
        <SnackbarProvider>
          <TestWithSnackbar />
        </SnackbarProvider>,
      )
      const snackbar = screen.getByTestId('snackbar')
      expect(snackbar).toHaveAttribute('data-color', color)
      expect(snackbar).toHaveTextContent(`${expected} message`)
    })
  })
})
