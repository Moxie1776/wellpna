import { Box, Button, Drawer, IconButton, Paper, useTheme } from '@mui/material'
import { useMemo, useState } from 'react'
import { MdDashboard, MdHome, MdMenu } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useMobile'
import { useMode } from '@/hooks/useMode'
import { appRoutes } from '@/lib/routes'

export function AppSidebar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { signOut, user } = useAuth()
  const isMobile = useIsMobile()
  const { mode } = useMode()
  const theme = useTheme()

  // Expose linkColor variable for easy usage and discovery
  const linkColor = mode === 'dark' ? 'primary[300]' : 'primary[700]'

  // Filter links by auth and role
  const filteredLinks = useMemo(
    () =>
      appRoutes.filter((link) => {
        if (isAuthenticated) {
          // Hide Home when authenticated
          if (link.label === 'Home') return false
          // Only show links that require auth or are general
          // (not public auth routes)
          const isAuthRoute =
            link.requiresAuth ||
            (!link.requiresAuth &&
              ![
                'Sign In',
                'Sign Up',
                'Password Reset',
                'Email Verification',
                'Forbidden',
                'Server Error',
                'Not Found',
              ].includes(link.label))

          // Check role requirements
          if (link.requiredRole && user?.role !== link.requiredRole) {
            return false
          }

          return isAuthRoute
        }
        // Unauthenticated: show only links that do not require auth,
        // excluding error pages

        return (
          !link.requiresAuth &&
          !['Forbidden', 'Server Error', 'Not Found'].includes(link.label)
        )
      }),
    [isAuthenticated, user],
  )

  const [open, setOpen] = useState(false)

  // Sidebar content
  const sidebarContent = (
    <>
      <Box
        sx={{
          padding: '1rem 1rem',
          fontWeight: 700,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          gap: 8,
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: theme.palette.common.white,
        }}
      >
        {/* home/dashboard toggle icon */}
        <IconButton
          color="neutral"
          size="small"
          sx={{ mr: 1, color: '#fff' }}
        >
          {isAuthenticated ? (
            <MdDashboard size={24} data-testid="sidebar-dashboard-icon" />
          ) : (
            <MdHome size={24} data-testid="sidebar-home-icon" />
          )}
        </IconButton>
        {/* Home/dashboard icon and clickable WellPnA */}
        WellPnA
      </Box>
      <nav style={{ flex: 1 }}>
        {filteredLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.label}
              to={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0.75rem 1rem',
                textDecoration: 'none',
                borderRadius: 6,
                fontWeight: 500,
                margin: '0.25rem 0',
                transition: 'background 0.2s',
                color: linkColor,
              }}
              onClick={() => isMobile && setOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f7f7f9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ''
              }}
            >
              {Icon ? <Icon size={20} /> : null}
              {link.label}
            </Link>
          )
        })}
      </nav>
      {isAuthenticated && (
        <Button
          fullWidth
          onClick={signOut}
          role="button"
          sx={{
            padding: '1rem',
            borderColor: 'neutral.main',
            color: 'neutral.main',
            '&:hover': {
              borderColor: 'neutral.dark',
              backgroundColor: 'neutral.main',
              color: 'neutral.contrastText',
            },
          }}
        >
          Logout
        </Button>
      )}
    </>
  )

  if (isMobile) {
    return (
      <Box>
        <IconButton
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            backgroundColor: 'neutral.main',
            color: 'neutral.contrastText',
            '&:hover': {
              backgroundColor: 'neutral.dark',
            },
          }}
          onClick={() => setOpen(true)}
        >
          <MdMenu size={28} />
        </IconButton>
        <Drawer open={open} onClose={() => setOpen(false)} anchor="left">
          <Paper
            elevation={6}
            sx={{
              width: 220,
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {sidebarContent}
          </Paper>
        </Drawer>
      </Box>
    )
  }

  return (
    <Paper
      elevation={6}
      style={{
        width: 220,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      sx={{ borderRight: '1px solid' }}
    >
      {sidebarContent}
    </Paper>
  )
}
