import { Box, Button, Drawer, IconButton, Sheet } from '@mui/joy'
import { IconButton as JoyIconButton } from '@mui/joy'
import * as React from 'react'
import { MdDashboard, MdHome, MdMenu } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/useAuth'
import { useMode } from '@/hooks/useMode'
import { appRoutes } from '@/routes'

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
    if (link.requiresAuth) return isAuthenticated
    return !link.requiresAuth
  })

  const [open, setOpen] = React.useState(false)

  // Sidebar content
  const sidebarContent = (
    <>
      <Box
        sx={{
          variant: 'soft',
          padding: '1rem 1rem',
          fontWeight: 700,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--joy-palette-primary-500)',
          gap: 8,
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: '#fff',
        }}
      >
        {/* Theme toggle icon */}
        <JoyIconButton variant="plain" color="neutral" size="sm" sx={{ mr: 1 }}>
          {isAuthenticated ? <MdDashboard size={24} /> : <MdHome size={24} />}
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
        <div style={{ padding: '1rem' }}>
          <Button
            variant="outlined"
            color="neutral"
            fullWidth
            onClick={signOut}
          >
            Logout
          </Button>
        </div>
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
