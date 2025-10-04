import './global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'

import Layout from './components/layout/layout'
import { client } from './lib/graphqlClient'
import { SnackbarProvider } from './providers/SnackbarProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { appRoutes } from './routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UrqlProvider value={client}>
          <SnackbarProvider>
            <Routes>
              {appRoutes.map((route) => (
                <Route
                  key={route.href}
                  path={route.href}
                  element={
                    <Layout>{route.page ? <route.page /> : null}</Layout>
                  }
                />
              ))}
            </Routes>
          </SnackbarProvider>
        </UrqlProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
