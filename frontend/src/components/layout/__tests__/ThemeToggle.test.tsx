import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { useModeStore } from '../../../store/theme'
import ThemeToggle from '../ThemeToggle'

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles from light to dark mode when clicked', async () => {
    const user = userEvent.setup()

    // Set initial mode to light
    useModeStore.setState({ mode: 'light' })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    // Check that the store state was updated
    expect(useModeStore.getState().mode).toBe('dark')
  })

  it('toggles from dark to light mode when clicked', async () => {
    const user = userEvent.setup()

    // Set initial mode to dark
    useModeStore.setState({ mode: 'dark' })

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    // Check that the store state was updated
    expect(useModeStore.getState().mode).toBe('light')
  })
})
