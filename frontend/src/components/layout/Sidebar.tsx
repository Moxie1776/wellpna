import { Box, Drawer, IconButton, Paper, useTheme } from '@mui/material'
import { useMemo, useState } from 'react'
import { FaSignOutAlt } from 'react-icons/fa'
import { MdDashboard, MdHome, MdMenu } from 'react-icons/md'
import { Link } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useMobile'
import { useMode } from '@/hooks/useMode'
import { appRoutes } from '@/lib/routes'

interface SidebarLinkProps {
  to?: string
  onClick?: () => void
  icon?: React.ComponentType<{ size?: number }>
  children: React.ReactNode
  linkColor: string
}

function SidebarLink({
  to,
  onClick,
  icon: Icon,
  children,
  linkColor,
}: SidebarLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to === '#') {
      e.preventDefault()
    }
    onClick?.()
  }

  return (
    <Link
      to={to || '#'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '12px 16px',
        textDecoration: 'none',
        borderRadius: 1,
        fontWeight: 500,
        margin: '4px 0',
        transition: 'background 0.2s',
        color: linkColor,
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f7f7f9'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = ''
      }}
    >
      {Icon && <Icon size={20} />}
      {children}
    </Link>
  )
}

export function AppSidebar({ backgroundColor }: { backgroundColor?: string }) {
  const { signOut, user } = useAuth()
  const isAuthenticated = !!user
  const isMobile = useIsMobile()
  const { mode } = useMode()
  const theme = useTheme()

  // Expose linkColor variable for easy usage and discovery
  const linkColor =
    mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main

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
        <IconButton color="neutral" size="small" sx={{ mr: 1, color: '#fff' }}>
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
        {filteredLinks.map((link) => (
          <SidebarLink
            key={link.label}
            to={link.href}
            icon={link.icon}
            linkColor={linkColor}
            onClick={() => isMobile && setOpen(false)}
          >
            {link.label}
          </SidebarLink>
        ))}
      </nav>
      {isAuthenticated && (
        <SidebarLink
          onClick={signOut}
          icon={FaSignOutAlt}
          linkColor={linkColor}
        >
          Sign Out
        </SidebarLink>
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
            elevation={8}
            sx={{
              width: 220,
              // minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              backgroundColor: 'transparent',
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
      style={{
        width: 220,
        maxHeight: '100vh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      sx={{
        backgroundColor,
        borderRight: '1px solid',
      }}
    >
      {sidebarContent}
    </Paper>
  )
}
