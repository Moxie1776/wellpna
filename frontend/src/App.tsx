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

function AppContent() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Routes>
      {appRoutes.map((route) => {
        let element = route.page ? <route.page /> : null

        if (route.requiresAuth && !user) {
          element = <Navigate to="/signin" replace />
        } else if (route.requiredRole && user?.role !== route.requiredRole) {
          element = <Navigate to="/forbidden" replace />
        } else if (route.requiresAuth) {
          element = <ProtectedRoute>{element}</ProtectedRoute>
        }

        return (
          <Route
            key={route.href}
            path={route.href}
            element={<Layout>{element}</Layout>}
          />
        )
      })}
    </Routes>
  )
}

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
