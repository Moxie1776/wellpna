import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SnackbarProvider } from '../snackbar'

describe('Snackbar Rendering Tests', () => {
  it('renders SnackbarProvider with children', () => {
    render(
      <SnackbarProvider>
        <div data-testid="test-component">Test Component</div>
      </SnackbarProvider>,
    )
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
  })
})
