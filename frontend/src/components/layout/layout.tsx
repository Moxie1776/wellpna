import { Box, Sheet } from '@mui/joy'
import { ReactNode } from 'react'

import { useAuthStore } from '@/store/auth'

import { Breadcrumbs } from './Breadcrumbs'
import { AppSidebar as Sidebar } from './Sidebar'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!user
  return (
    <Sheet
      sx={{
        display: 'flex',
        minHeight: '100vh',
        minWidth: '100vw',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <Sidebar isAuthenticated={isAuthenticated} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 64,
            borderBottom: '1px solid',
            borderColor: 'divider',
            padding: '0 1rem',
            gap: '1rem',
          }}
        >
          <Breadcrumbs />
          <div />
          <ThemeToggle />
        </header>
        <main style={{ flex: 1, padding: '1rem', borderWidth: 0 }}>
          {children}
        </main>
      </Box>
    </Sheet>
  )
}
