import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { cacheExchange, createClient, fetchExchange, Provider } from 'urql'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createAdminTestUser,
  setupSignedInTestUser,
} from '../tests/utils/testUsers'
import { AppContent } from './App'
import { appRoutes } from './lib/routes'
import { SnackbarProvider } from './providers/SnackbarProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { useAuthStore } from './store/auth'

describe('App Route Protection', () => {
  const renderWithProviders = (initialEntries: string[] = ['/']) => {
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
    const router = createMemoryRouter(
      [
        {
          path: '/*',
          element: <AppContent />,
        },
      ],
      {
        initialEntries,
        initialIndex: 0,
      },
    )

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

  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null })
    localStorage.removeItem('token')
  })

  describe('Public Routes', () => {
    const publicRoutes = appRoutes.filter(
      route => !route.requiresAuth && route.href !== '*',
    )

    it.each(publicRoutes.map(route => [route.label, route.href]))(
      'allows access to %s (%s) for unauthenticated users',
      (_label, href) => {
        renderWithProviders([href])

        // For home page, check for specific content
        if (href === '/') {
          expect(screen.getByText('WellPNA')).toBeInTheDocument()
          expect(
            screen.getByText('Well Plug & Abandonment Solutions'),
          ).toBeInTheDocument()
        }
        // For other public routes, just ensure we don't get redirected to home
        else {
          expect(screen.queryByText('WellPNA')).not.toBeInTheDocument()
        }
      },
    )
  })

  describe('Protected Routes', () => {
    const protectedRoutes = appRoutes.filter(
      route => route.requiresAuth && !route.requiredRole,
    )

    it.each(protectedRoutes.map(route => [route.label, route.href]))(
      'redirects unauthenticated users from %s (%s) to home',
      (_label, href) => {
        renderWithProviders([href])

        expect(screen.getByText('WellPNA')).toBeInTheDocument()
        expect(
          screen.getByText('Well Plug & Abandonment Solutions'),
        ).toBeInTheDocument()
      },
    )

    it.each(protectedRoutes.map(route => [route.label, route.href]))(
      'allows authenticated users to access %s (%s)',
      async (_label, href) => {
        await setupSignedInTestUser()

        renderWithProviders([href])

        // For dashboard, check for specific content
        if (href === '/dashboard') {
          expect(screen.getByText('WellPnA Dashboard')).toBeInTheDocument()
        }
        // For other protected routes, just ensure we don't get redirected
        else {
          expect(screen.queryByText('WellPNA')).not.toBeInTheDocument()
        }
      },
    )
  })

  describe('Admin Routes', () => {
    const adminRoutes = appRoutes.filter(
      route => route.requiredRole === 'admin',
    )

    it.each(adminRoutes.map(route => [route.label, route.href]))(
      'redirects non-admin users from %s (%s) to forbidden',
      async (_label, href) => {
        await setupSignedInTestUser()

        renderWithProviders([href])

        expect(screen.getByText('403 - Access Forbidden')).toBeInTheDocument()
        expect(
          screen.getByText('You don\'t have permission to access this page.'),
        ).toBeInTheDocument()
      },
    )

    it.each(adminRoutes.map(route => [route.label, route.href]))(
      'allows admin users to access %s (%s)',
      async (_label, href) => {
        await createAdminTestUser()

        renderWithProviders([href])

        // For admin page, check for specific content
        if (href === '/admin') {
          expect(screen.getByText('User Management')).toBeInTheDocument()
        }
        // For other admin routes, just ensure we don't get redirected
        else {
          expect(
            screen.queryByText('403 - Access Forbidden'),
          ).not.toBeInTheDocument()
        }
      },
    )
  })

  describe('Special Routing Behavior', () => {
    it('redirects authenticated users from home to dashboard', async () => {
      await setupSignedInTestUser()

      renderWithProviders(['/'])

      expect(screen.getByText('WellPnA Dashboard')).toBeInTheDocument()
    })
  })
})
