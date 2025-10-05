import './global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'

import Layout from './components/layout/layout'
import { appRoutes } from './lib/routes'
import { ProtectedRoute } from './providers/ProtectedRouteProvider'
import { SnackbarProvider } from './providers/SnackbarProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { client } from './utils'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UrqlProvider value={client}>
          <SnackbarProvider>
            <Routes>
              {appRoutes.map((route) => {
                const element = route.page ? <route.page /> : null
                const wrappedElement = route.requiresAuth ? (
                  <ProtectedRoute>{element}</ProtectedRoute>
                ) : (
                  element
                )
                return (
                  <Route
                    key={route.href}
                    path={route.href}
                    element={<Layout>{wrappedElement}</Layout>}
                  />
                )
              })}
            </Routes>
          </SnackbarProvider>
        </UrqlProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
