import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useAuthStore } from '../../store/auth'
import { ProtectedRoute } from '../ProtectedRouteProvider'

// Real auth store implementation for integrated testing

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        phoneNumber: '123-456-7890',
        role: 'user',
      },
      token: 'fake-token',
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    // When unauthenticated, children should not be rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
