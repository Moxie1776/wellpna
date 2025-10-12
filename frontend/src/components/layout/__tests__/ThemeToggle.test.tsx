import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Zustand store
vi.mock('../../../store/theme', () => {
  const useModeStore = vi.fn()
  return { useModeStore }
})

// Mock MUI Joy components to avoid CSS parsing issues in jsdom
vi.mock('@mui/joy', () => {
  function IconButton(props: any) {
    const { children, onClick, disabled, 'aria-label': ariaLabel, type } = props
    return createElement(
      'button',
      { onClick, disabled, 'aria-label': ariaLabel, type },
      children,
    )
  }
  function Tooltip({ children }: any) {
    return createElement('div', {}, children)
  }
  return { IconButton, Tooltip }
})

import { createElement } from 'react'

import { useModeStore as mockUseModeStore } from '../../../store/theme'
import ThemeToggle from '../ThemeToggle'

describe('ThemeToggle', () => {
  let mockSetMode: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSetMode = vi.fn()

    // Mock Zustand store
    ;(mockUseModeStore as any).mockImplementation(
      (selector?: (state: any) => any) => {
        const state = {
          mode: 'light',
          setMode: mockSetMode,
        }
        return selector ? selector(state) : state
      },
    )
  })

  it('renders without crashing', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('calls setMode when clicked in light mode', async () => {
    const user = userEvent.setup()

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockSetMode).toHaveBeenCalledWith('dark')
    expect(mockSetMode).toHaveBeenCalledTimes(1)
  })

  it('calls setMode when clicked in dark mode', async () => {
    const user = userEvent.setup()

    // Change the mock to return dark mode
    ;(mockUseModeStore as any).mockImplementation(
      (selector?: (state: any) => any) => {
        const state = {
          mode: 'dark',
          setMode: mockSetMode,
        }
        return selector ? selector(state) : state
      },
    )

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockSetMode).toHaveBeenCalledWith('light')
    expect(mockSetMode).toHaveBeenCalledTimes(1)
  })
})
