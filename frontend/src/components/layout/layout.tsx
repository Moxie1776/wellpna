import Drawer from '@mui/joy/Drawer';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import * as React from 'react';
import { MdMenu } from 'react-icons/md';
import { Link,useLocation } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Sign In', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
  { label: 'Password Reset', href: '/reset-password' },
  { label: 'Email Verification', href: '/verify-email' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  // const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => setMobileOpen((open) => !open);

  const drawer = (
    <Sheet variant='outlined' sx={{ width: 240, height: '100vh', p: 2 }}>
      <Typography level='h4' sx={{ mb: 2 }}>
        WellPNA
      </Typography>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.label}>
            <ListItemButton
              component={Link}
              to={link.href}
              selected={location.pathname === link.href}
              sx={{ borderRadius: 'sm' }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Sheet>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar for desktop */}
      <Sheet
        variant='outlined'
        sx={{
          width: { xs: 0, md: 240 },
          display: { xs: 'none', md: 'block' },
          height: '100vh',
          p: 2,
        }}
      >
        <Typography level='h4' sx={{ mb: 2 }}>
          WellPNA
        </Typography>
        <List>
          {navLinks.map((link) => (
            <ListItem key={link.label}>
              <ListItemButton
                component={Link}
                to={link.href}
                selected={location.pathname === link.href}
                sx={{ borderRadius: 'sm' }}
              >
                {link.label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Sheet>

      {/* Drawer for mobile */}
      <Drawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        anchor='left'
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 64,
            borderBottom: '1px solid #eee',
            padding: '0 1rem',
            gap: '1rem',
          }}
        >
          {/* Mobile menu button */}
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MdMenu size={24} />
          </IconButton>
          {/* Breadcrumbs */}
          <Typography level='title-lg' sx={{ flex: 1 }}>
            {/* Simple breadcrumbs: Home / Current Page */}
            {location.pathname === '/'
              ? 'Home'
              : location.pathname.split('/').filter(Boolean).join(' / ')}
          </Typography>
          {/* Theme toggle */}
          <ThemeToggle />
        </header>
        <main style={{ flex: 1, padding: '1rem' }}>{children}</main>
      </div>
    </div>
  );
}
