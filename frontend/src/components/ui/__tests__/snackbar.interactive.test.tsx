import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Interactive Tests', () => {
  it('queues new notifications and displays stacked messages', () => {
    const TestWithMultiple = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({
          message: 'First message',
          color: 'primary',
          autoHideDuration: 100,
        })
        showSnackbar({
          message: 'Second message',
          color: 'error',
          autoHideDuration: 100,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithMultiple />
      </SnackbarProvider>,
    )
    const primary = screen.getByTestId('snackbar')
    expect(primary).toHaveTextContent('First message')
    expect(primary).toHaveAttribute('data-color', 'primary')
    // Second message should be present (stacked) but primary remains the first
    const secondText = screen.getByText('Second message')
    expect(secondText).toBeInTheDocument()
    // the data attributes are on the Snackbar container (role="alert") so
    // find the closest ancestor with role="alert" and assert there
    const secondContainer = secondText.closest('[role="alert"]') as HTMLElement
    expect(secondContainer).toHaveAttribute('data-color')
  })

  it('handles rapid successive notifications', () => {
    const TestWithRapid = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({
          message: 'Message 1',
          color: 'primary',
          autoHideDuration: 100,
        })
        showSnackbar({ message: 'Message 2', color: 'warning' })
        showSnackbar({ message: 'Message 3', color: 'error' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithRapid />
      </SnackbarProvider>,
    )
    const primary = screen.getByTestId('snackbar')
    expect(primary).toHaveTextContent('Message 1')

    // Message 2 should now be queued/stacked
    const msg2 = screen.getByText('Message 2')
    expect(msg2).toBeInTheDocument()

    // Message 3 should also be present
    const msg3 = screen.getByText('Message 3')
    expect(msg3).toBeInTheDocument()
    const lastContainer = msg3.closest('[role="alert"]') as HTMLElement
    expect(lastContainer).toHaveAttribute('data-color')
  })

  it('maintains open state when new notification is shown', () => {
    const TestWithState = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({
          message: 'First',
          color: 'primary',
          autoHideDuration: 100,
        })
        showSnackbar({ message: 'Second', color: 'warning' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithState />
      </SnackbarProvider>,
    )
    const primary = screen.getByTestId('snackbar')
    expect(primary).toHaveTextContent('First')
    // Both first and second should be visible (stacked)
    const secondNode = screen.getByText('Second')
    expect(secondNode).toBeVisible()
    expect(primary).toBeVisible()
  })
})
