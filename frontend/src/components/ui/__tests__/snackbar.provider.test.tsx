import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import * as React from 'react'

import { SnackbarProvider, useSnackbar } from '../snackbar'

describe('Snackbar Provider Tests', () => {
  it('provides showSnackbar function through context', () => {
    render(
      <SnackbarProvider>
        <div data-testid="test-component">Test Component</div>
      </SnackbarProvider>,
    )
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
  })

  it('throws error when useSnackbar is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const TestWithoutProvider = () => {
      useSnackbar()
      return <div />
    }
    expect(() => {
      render(<TestWithoutProvider />)
    }).toThrow('useSnackbar must be used within a SnackbarProvider')
    consoleSpy.mockRestore()
  })

  it('maintains snackbar state across re-renders', () => {
    let renderCount = 0
    const TestWithSnackbar = () => {
      const { showSnackbar } = useSnackbar()
      React.useEffect(() => {
        renderCount++
        if (renderCount === 1) {
          showSnackbar({ message: 'State test', color: 'primary' })
        }
      }, [])
      return <div>Renders: {renderCount}</div>
    }
    const { rerender } = render(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    expect(screen.getByText(/Renders:/)).toBeInTheDocument()
    expect(screen.getByTestId('snackbar')).toBeInTheDocument()
    rerender(
      <SnackbarProvider>
        <TestWithSnackbar />
      </SnackbarProvider>,
    )
    expect(screen.getByText(/Renders:/)).toBeInTheDocument()
    expect(screen.getByTestId('snackbar')).toBeInTheDocument()
  })
})
