import { Box, Paper } from '@mui/material'
import { darken, lighten, useTheme } from '@mui/material/styles'
import { Outlet } from 'react-router-dom'

import { useMode } from '@/hooks/useMode'
import { useAuthStore } from '@/store/auth'

import { Breadcrumbs } from './Breadcrumbs'
import { AppSidebar as Sidebar } from './Sidebar'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const user = useAuthStore((state) => state.user)
  const { mode } = useMode()
  const theme = useTheme()

  const backgroundColor =
    mode === 'dark'
      ? lighten(theme.palette.background.default, 0.2)
      : darken(theme.palette.background.default, 0.2)
  return (
    <Paper
      sx={{
        display: 'flex',
        minHeight: '100vh',
        maxHeight: '100vh',
        minWidth: '100vw',
        maxWidth: '100vw',
      }}
    >
      <Sidebar backgroundColor={backgroundColor} key={user?.role} />
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
            backgroundColor: { backgroundColor },
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
          <Outlet />
        </Paper>
      </Box>
    </Paper>
  )
}
