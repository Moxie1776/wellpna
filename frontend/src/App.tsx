import './global.css'

import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'

import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/layout/layout'
import { appRoutes } from './lib/routes'
import { ProtectedRoute } from './providers/ProtectedRouteProvider'
import { SnackbarProvider } from './providers/SnackbarProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { useAuthStore } from './store/auth'
import { client } from './utils'

export function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const authRoutes = appRoutes.filter((route) => route.requiresAuth === true)
  const publicRoutes = appRoutes.filter(
    (route) =>
      !route.requiresAuth &&
      !['/forbidden', '/server-error', '*'].includes(route.href),
  )
  const errorRoutes = appRoutes.filter((route) =>
    ['/forbidden', '/server-error', '*'].includes(route.href),
  )

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {authRoutes.map((route) => {
          let element = route.page ? <route.page /> : null

          // Redirect authenticated to dashboard w/ private only routes
          if (route.requiredRole && user?.role !== route.requiredRole) {
            element = <Navigate to="/forbidden" replace />
          } else if (route.requiresAuth) {
            element = <ProtectedRoute>{element}</ProtectedRoute>
          }

          return <Route key={route.href} path={route.href} element={element} />
        })}
        {publicRoutes.map((route) => {
          let element = route.page ? <route.page /> : null

          // Redirect authenticated users from home to dashboard
          if (route.href === '/' && user) {
            element = <Navigate to="/dashboard" replace />
          } else if (route.requiresAuth && !user) {
            element = <Navigate to="/" replace />
          }

          return (
            <Route
              key={route.href}
              path={route.href === '/' ? undefined : route.href}
              index={route.href === '/' ? true : undefined}
              element={element}
            />
          )
        })}
        {errorRoutes.map((route) => (
          <Route
            key={route.href}
            path={route.href}
            element={route.page ? <route.page /> : null}
          />
        ))}
      </Route>
    </Routes>
  )
}
// Only render to DOM when not in test environment
if (typeof window !== 'undefined' && document.getElementById('root')) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <UrqlProvider value={client}>
            <SnackbarProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </SnackbarProvider>
          </UrqlProvider>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}
