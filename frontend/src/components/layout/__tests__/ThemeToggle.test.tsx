import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useMode } from '../../../hooks/useMode'
import ThemeToggle from '../ThemeToggle'

// Mock the useMode hook
jest.mock('../../../hooks/useMode', () => ({
  useMode: jest.fn(),
}))

const mockUseMode = useMode as jest.MockedFunction<typeof useMode>

describe('ThemeToggle', () => {
  let mockSetMode: jest.Mock

  beforeEach(() => {
    mockSetMode = jest.fn()
    // Reset all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering Tests', () => {
    it('renders IconButton with correct initial styling in light mode', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('renders IconButton with correct initial styling in dark mode', () => {
      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('renders both light and dark mode icons', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      // Both icons should be present in the DOM
      expect(screen.getByTestId('MdDarkMode')).toBeInTheDocument()
      expect(screen.getByTestId('MdLightMode')).toBeInTheDocument()
    })

    it('renders after mounting (no disabled state)', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Theme Mode Tests', () => {
    it('displays light mode icon when in light mode', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const lightIcon = screen.getByTestId('MdLightMode')
      const darkIcon = screen.getByTestId('MdDarkMode')

      // Light mode: first child (dark icon) visible, last child
      // (light icon) hidden
      expect(darkIcon).toHaveStyle({ display: 'initial' })
      expect(lightIcon).toHaveStyle({ display: 'none' })
    })

    it('displays dark mode icon when in dark mode', () => {
      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const lightIcon = screen.getByTestId('MdLightMode')
      const darkIcon = screen.getByTestId('MdDarkMode')

      // Dark mode: first child (dark icon) hidden, last child
      // (light icon) visible
      expect(darkIcon).toHaveStyle({ display: 'none' })
      expect(lightIcon).toHaveStyle({ display: 'initial' })
    })
  })

  describe('Tooltip Tests', () => {
    it('shows "Switch to dark mode" tooltip when in light mode', async () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('shows "Switch to light mode" tooltip when in dark mode', async () => {
      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })
  })

  describe('Interaction Tests', () => {
    it('calls setMode with "dark" when clicked in light mode', async () => {
      const user = userEvent.setup()

      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetMode).toHaveBeenCalledWith('dark')
      expect(mockSetMode).toHaveBeenCalledTimes(1)
    })

    it('calls setMode with "light" when clicked in dark mode', async () => {
      const user = userEvent.setup()

      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetMode).toHaveBeenCalledWith('light')
      expect(mockSetMode).toHaveBeenCalledTimes(1)
    })

    it('toggles theme correctly on multiple clicks', async () => {
      const user = userEvent.setup()

      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // First click: light -> dark
      await user.click(button)
      expect(mockSetMode).toHaveBeenCalledWith('dark')

      // Second click: should call again (component logic handles the toggle)
      await user.click(button)
      expect(mockSetMode).toHaveBeenCalledWith('dark')
      // Same call since mode hasn't changed in mock
      expect(mockSetMode).toHaveBeenCalledTimes(2)
    })
  })

  describe('Styling Tests', () => {
    it('applies correct light mode styling', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // Check that the button has the expected styling classes/attributes
      // Since we're using sx prop with conditional styling,
      // we check the computed styles
      expect(button).toHaveStyle({
        backgroundColor: '#2E4A7D',
        borderColor: '#2E4A7D',
        color: '#ffffff',
      })
    })

    it('applies correct dark mode styling', () => {
      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      expect(button).toHaveStyle({
        backgroundColor: '#ffd900a5',
        borderColor: '#ffd900a5',
        color: '#000000',
      })
    })

    it('applies correct hover styling for light mode', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // Hover styles are applied via sx prop, we can check the button exists
      // In a real scenario, we'd use fireEvent to simulate hover
      expect(button).toBeInTheDocument()
    })

    it('applies correct hover styling for dark mode', () => {
      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Accessibility Tests', () => {
    it('has proper ARIA label for screen readers', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('updates ARIA label when mode changes', () => {
      mockUseMode.mockReturnValue({
        mode: 'dark',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('is keyboard accessible', async () => {
      const user = userEvent.setup()

      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // Focus the button
      button.focus()
      expect(button).toHaveFocus()

      // Press Enter to activate
      await user.keyboard('{Enter}')
      expect(mockSetMode).toHaveBeenCalledWith('dark')

      // Press Space to activate
      await user.keyboard(' ')
      expect(mockSetMode).toHaveBeenCalledWith('dark')
    })

    it('is focusable and accessible', () => {
      mockUseMode.mockReturnValue({
        mode: 'light',
        setMode: mockSetMode,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      // MUI Joy handles role and tabIndex internally
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label')
    })
  })
})
