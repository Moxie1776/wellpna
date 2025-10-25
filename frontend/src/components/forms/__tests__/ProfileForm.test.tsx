import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { cacheExchange, createClient, fetchExchange, Provider } from 'urql'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  setupSignedInTestUser,
} from '../../../../tests/utils/testUsers'
import { SnackbarProvider } from '../../../components/ui/snackbar'
import { ThemeProvider } from '../../../providers/ThemeProvider'
import { useAuthStore } from '../../../store/auth'
import { ProfileForm } from '../ProfileForm'

describe('ProfileForm', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(async () => {
    user = userEvent.setup()
    await setupSignedInTestUser()
  })

  const renderWithProviders = (component: ReactElement) => {
    const client = createClient({
      url: 'http://localhost:4000/graphql',
      exchanges: [cacheExchange, fetchExchange],
      fetchOptions: () => {
        const token = localStorage.getItem('token')
        return {
          headers: {
            authorization: token ? `Bearer ${token}` : '',
          },
        }
      },
    })
    const router = createMemoryRouter([{ path: '/', element: component }], {
      initialEntries: ['/'],
    })

    return render(
      <Provider value={client}>
        <ThemeProvider>
          <SnackbarProvider>
            <RouterProvider router={router} />
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>,
    )
  }

  it('renders the form with user data', () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    expect(screen.getByDisplayValue(currentUser?.email || '')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /update profile/i }),
    ).toBeInTheDocument()
  })

  it('shows email as disabled', () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    const emailInput = screen.getByDisplayValue(currentUser?.email || '')
    expect(emailInput).toBeDisabled()
  })

  it('calls updateUser mutation on form submit', async () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    const nameInput = screen.getByLabelText(/name/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.clear(phoneInput)
    await user.type(phoneInput, '555-987-6543')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Profile updated successfully!'),
      ).toBeInTheDocument()
    })
  })

  it('shows success message on successful update', async () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    const nameInput = screen.getByLabelText(/name/i)
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

  it('trims whitespace from inputs', async () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    const nameInput = screen.getByLabelText(/name/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.type(nameInput, '  Updated Name  ')
    await user.clear(phoneInput)
    await user.type(phoneInput, '  555-987-6543  ')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Profile updated successfully!'),
      ).toBeInTheDocument()
    })
  })

  it('shows validation error for empty name', async () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(nameInput)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows validation error for empty phone number', async () => {
    const currentUser = useAuthStore.getState().user
    renderWithProviders(<ProfileForm user={currentUser} />)

    const phoneInput = screen.getByLabelText(/phone number/i)
    const submitButton = screen.getByRole('button', { name: /update profile/i })

    await user.clear(phoneInput)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    })
  })
})
