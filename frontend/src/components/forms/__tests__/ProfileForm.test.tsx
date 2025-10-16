import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useMutation } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProfileForm } from '../ProfileForm'

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock urql
vi.mock('urql', () => ({
  useMutation: vi.fn(),
  gql: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}))

describe('ProfileForm', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    phoneNumber: '555-123-4567',
  }

  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useMutation as any).mockReturnValue([null, mockUpdateUser])
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
          id: 1,
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

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    fireEvent.change(phoneInput, { target: { value: '555-987-6543' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        name: 'Updated Name',
        phoneNumber: '555-987-6543',
      })
    })
  })

  it('shows success message on successful update', async () => {
    mockUpdateUser.mockResolvedValue({
      data: {
        updateUser: {
          id: 1,
          email: 'test@example.com',
          name: 'Updated Name',
          phoneNumber: '555-987-6543',
        },
      },
    })

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    fireEvent.click(submitButton)

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

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Authentication required')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Network error'))

    render(<ProfileForm user={mockUser} />)

    const nameInput = screen.getByDisplayValue('Test User')
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
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

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    fireEvent.click(submitButton)

    // Check loading state
    expect(submitButton).toBeDisabled()

    // Resolve the mutation
    resolveMutation!({
      data: {
        updateUser: {
          id: 1,
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
          id: 1,
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

    fireEvent.change(nameInput, { target: { value: '  Updated Name  ' } })
    fireEvent.change(phoneInput, { target: { value: '  555-987-6543  ' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        name: 'Updated Name',
        phoneNumber: '555-987-6543',
      })
    })
  })
})
