import { Box, Paper } from '@mui/material'
import { ReactNode } from 'react'

import { useAuthStore } from '@/store/auth'

import { Breadcrumbs } from './Breadcrumbs'
import { AppSidebar as Sidebar } from './Sidebar'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!user
  return (
    <Paper
      sx={{
        display: 'flex',
        minHeight: '100vh',
        maxHeight: '100vh',
        minWidth: '100vw',
        maxWidth: '100vw',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <Sidebar isAuthenticated={isAuthenticated} key={user?.role} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          component="header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            borderBottom: '1px solid',
            borderColor: 'divider',
            padding: '0 1rem',
          }}
        >
          <Breadcrumbs />
          <ThemeToggle />
        </Box>
        <Paper
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </Paper>
      </Box>
    </Paper>
  )
}
