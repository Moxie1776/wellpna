import { act, render, screen } from '@testing-library/react'
import * as React from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Interactive Tests', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  it('replaces previous notification with new one', () => {
    const TestWithMultiple = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({
          message: 'First message',
          color: 'primary',
          autoHideDuration: 100,
        })
        setTimeout(() => {
          showSnackbar({
            message: 'Second message',
            color: 'danger',
            autoHideDuration: 100,
          })
        }, 100)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithMultiple />
      </SnackbarProvider>,
    )
    const snackbar = screen.getByTestId('snackbar')
    expect(snackbar).toHaveTextContent('First message')
    expect(snackbar).toHaveAttribute('data-color', 'primary')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Second message')
    expect(snackbar).toHaveAttribute('data-color', 'danger')
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
        setTimeout(() => {
          showSnackbar({
            message: 'Message 2',
            color: 'warning',
            autoHideDuration: 100,
          })
          setTimeout(() => {
            showSnackbar({
              message: 'Message 3',
              color: 'danger',
              autoHideDuration: 100,
            })
          }, 100)
        }, 100)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithRapid />
      </SnackbarProvider>,
    )
    const snackbar = screen.getByTestId('snackbar')
    expect(snackbar).toHaveTextContent('Message 1')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Message 2')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Message 3')
    expect(snackbar).toHaveAttribute('data-color', 'danger')
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
        setTimeout(() => {
          showSnackbar({
            message: 'Second',
            color: 'warning',
            autoHideDuration: 100,
          })
        }, 100)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <SnackbarProvider>
        <TestWithState />
      </SnackbarProvider>,
    )
    const snackbar = screen.getByTestId('snackbar')
    expect(snackbar).toHaveTextContent('First')
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Second')
    expect(snackbar).toBeVisible()
  })
})
