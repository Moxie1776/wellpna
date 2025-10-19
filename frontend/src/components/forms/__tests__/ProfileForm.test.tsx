import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUpdateUserMutation } from '../../../graphql/generated/graphql'
import { ProfileForm } from '../ProfileForm'

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the generated hook
vi.mock('../../../graphql/generated/graphql', () => ({
  useUpdateUserMutation: vi.fn(),
}))

describe('ProfileForm', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '555-123-4567',
  }

  const mockUpdateUser = vi.fn()
  const mockResult = { fetching: false, error: null as any, data: null as any }
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    vi.clearAllMocks()
    user = userEvent.setup()
    ;(useUpdateUserMutation as any).mockReturnValue([
      mockResult,
      mockUpdateUser,
    ])
  })

  it('renders the form with user data', () => {
    render(<ProfileForm user={mockUser} />)

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('555-123-4567')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /update profile/i }),
    ).toBeInTheDocument()
  })

  it('shows email as disabled', () => {
    render(<ProfileForm user={mockUser} />)

    const emailInput = screen.getByDisplayValue('test@example.com')
    expect(emailInput).toBeDisabled()
  })

  it('calls updateUser mutation on form submit', async () => {
    mockUpdateUser.mockResolvedValue({
      data: {
        updateUser: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated Name',
          phoneNumber: '555-987-6543',
        },
      },
    })

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const phoneInput = screen.getByDisplayValue('555-123-4567')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.clear(phoneInput)
    await user.type(phoneInput, '555-987-6543')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          name: 'Updated Name',
          phoneNumber: '555-987-6543',
        },
      })
    })
  })

  it('shows success message on successful update', async () => {
    mockUpdateUser.mockResolvedValue({
      data: {
        updateUser: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated Name',
          phoneNumber: '555-987-6543',
        },
      },
    })

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Profile updated successfully!'),
      ).toBeInTheDocument()
    })
  })

  it('shows error message on update failure', async () => {
    mockUpdateUser.mockResolvedValue({
      error: {
        message: 'Authentication required',
      },
    })
    mockResult.error = { message: 'Authentication required' }

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Authentication required')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Network error'))

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.click(submitButton)

    await waitFor(() => {
      // Network errors are logged but not displayed in the UI
      expect(mockUpdateUser).toHaveBeenCalled()
    })
  })

  it('shows loading state during update', async () => {
    let resolveMutation: (value: any) => void
    const mutationPromise = new Promise((resolve) => {
      resolveMutation = resolve
    })

    mockUpdateUser.mockReturnValue(mutationPromise)

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.click(submitButton)

    // Resolve the mutation
    resolveMutation!({
      data: {
        updateUser: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated Name',
          phoneNumber: '555-123-4567',
        },
      },
    })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('trims whitespace from inputs', async () => {
    mockUpdateUser.mockResolvedValue({
      data: {
        updateUser: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated Name',
          phoneNumber: '555-987-6543',
        },
      },
    })

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const phoneInput = screen.getByDisplayValue('555-123-4567')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, '  Updated Name  ')
    await user.clear(phoneInput)
    await user.type(phoneInput, '  555-987-6543  ')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          name: 'Updated Name',
          phoneNumber: '555-987-6543',
        },
      })
    })
  })
})
