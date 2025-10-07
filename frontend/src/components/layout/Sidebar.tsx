import { Box, Button, Drawer, IconButton, Sheet } from '@mui/joy'
import { IconButton as JoyIconButton } from '@mui/joy'
import * as React from 'react'
import { MdDashboard, MdHome, MdMenu } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useMobile'
import { useMode } from '@/hooks/useMode'
import { appRoutes } from '@/lib/routes'

export function AppSidebar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { signOut } = useAuth()
  const isMobile = useIsMobile()
  const { mode } = useMode()

  // Expose linkColor variable for easy usage and discovery
  const linkColor =
    mode === 'dark'
      ? 'var(--joy-palette-primary-300)'
      : 'var(--joy-palette-primary-700)'

  // Filter links by auth
  const filteredLinks = appRoutes.filter((link) => {
    if (isAuthenticated) {
      // Hide Home when authenticated
      if (link.label === 'Home') return false
      // Only show links that require auth or are general
      // (not public auth routes)
      return (
        link.requiresAuth ||
        (!link.requiresAuth &&
          ![
            'Sign In',
            'Sign Up',
            'Password Reset',
            'Email Verification',
          ].includes(link.label))
      )
    }
    // Unauthenticated: show only links that do not require auth
    return !link.requiresAuth
  })

  const [open, setOpen] = React.useState(false)

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
          backgroundColor: '#012d6c',
          gap: 8,
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: '#fff',
        }}
      >
        {/* Theme toggle icon */}
        <JoyIconButton
          variant="plain"
          color="neutral"
          size="sm"
          sx={{ mr: 1, color: '#fff' }}
        >
          {isAuthenticated ? (
            <MdDashboard size={24} data-testid="sidebar-dashboard-icon" />
          ) : (
            <MdHome size={24} data-testid="sidebar-home-icon" />
          )}
        </JoyIconButton>
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
          variant="outlined"
          color="neutral"
          fullWidth
          onClick={signOut}
          role="button"
          sx={{ padding: '1rem' }}
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
          variant="soft"
          color="neutral"
          sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200 }}
          onClick={() => setOpen(true)}
        >
          <MdMenu size={28} />
        </IconButton>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          anchor="left"
          size="sm"
        >
          <Sheet
            variant="soft"
            sx={{
              width: 220,
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {sidebarContent}
          </Sheet>
        </Drawer>
      </Box>
    )
  }

  return (
    <Sheet
      variant="soft"
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
    </Sheet>
  )
}
