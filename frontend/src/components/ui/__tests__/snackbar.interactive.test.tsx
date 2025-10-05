import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import * as React from 'react'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Interactive Tests', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  it('replaces previous notification with new one', () => {
    const TestWithMultiple = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'First message', color: 'primary' })
        setTimeout(() => {
          showSnackbar({ message: 'Second message', color: 'danger' })
        }, 100)
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
      jest.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Second message')
    expect(snackbar).toHaveAttribute('data-color', 'danger')
  })

  it('handles rapid successive notifications', () => {
    const TestWithRapid = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'Message 1', color: 'primary' })
        setTimeout(() => {
          showSnackbar({ message: 'Message 2', color: 'warning' })
          setTimeout(() => {
            showSnackbar({ message: 'Message 3', color: 'danger' })
          }, 100)
        }, 100)
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
      jest.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Message 2')
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Message 3')
    expect(snackbar).toHaveAttribute('data-color', 'danger')
  })

  it('maintains open state when new notification is shown', () => {
    const TestWithState = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        showSnackbar({ message: 'First', color: 'primary' })
        setTimeout(() => {
          showSnackbar({ message: 'Second', color: 'warning' })
        }, 100)
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
      jest.advanceTimersByTime(100)
    })
    expect(snackbar).toHaveTextContent('Second')
    expect(snackbar).toBeVisible()
  })
})
