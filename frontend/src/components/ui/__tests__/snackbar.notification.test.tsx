import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Notification Types Tests', () => {
  const scenarios = [
    { color: 'success', expected: 'success' },
    { color: 'neutral', expected: 'neutral' },
    { color: 'warning', expected: 'warning' },
    { color: 'error', expected: 'error' },
    { color: 'info', expected: 'info' },
  ]

  scenarios.forEach(({ color, expected }) => {
    it(`renders ${expected} notification with correct color`, () => {
      const TestWithSnackbar = () => {
        const { showSnackbar } = useSnackbar()
        React.useEffect(() => {
          showSnackbar({
            message: `${expected} message`,
            color: color as import('../snackbar').SnackbarColorKey,
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
      expect(snackbar).toHaveAttribute('data-color', color)
      expect(snackbar).toHaveTextContent(`${expected} message`)
    })
  })
})
