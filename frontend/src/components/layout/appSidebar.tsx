import { type ComponentProps } from 'react';
import {
  MdDashboard,
  MdEmail,
  MdHome,
  MdLogin,
  MdPersonAdd,
  MdVpnKey,
} from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: MdHome, requiresAuth: false },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: MdDashboard,
    requiresAuth: true,
  },
  { label: 'Sign In', href: '/login', icon: MdLogin, requiresAuth: false },
  { label: 'Sign Up', href: '/signup', icon: MdPersonAdd, requiresAuth: false },
  {
    label: 'Password Reset',
    href: '/reset-password',
    icon: MdVpnKey,
    requiresAuth: false,
  },
  {
    label: 'Email Verification',
    href: '/verify-email',
    icon: MdEmail,
    requiresAuth: false,
  },
];

interface AppSidebarProps {
  isAuthenticated: boolean;
}

export function AppSidebar({
  isAuthenticated,
  ...props
}: AppSidebarProps & ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { signOut } = useAuth();

  console.log('AppSidebar isAuthenticated:', isAuthenticated);

  const homeLink = isAuthenticated
    ? { label: 'WellPnA', href: '/dashboard', icon: MdDashboard }
    : { label: 'WellPnA', href: '/', icon: MdHome };

  const otherLinks = isAuthenticated
    ? navLinks.filter((link) => link.requiresAuth && link.href !== '/dashboard')
    : navLinks.filter((link) => !link.requiresAuth && link.href !== '/');

  return (
    <Sidebar collapsible='none' className='h-auto border-r' {...props}>
      <SidebarHeader className='border-b'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <Link to={homeLink.href}>
                <homeLink.icon className='!size-5' />
                <span className='text-base font-semibold'>
                  {homeLink.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherLinks.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === link.href}
                  >
                    <Link to={link.href}>
                      <link.icon className='!size-4' />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupContent>
              <Button variant='outlined' onClick={signOut} className='w-full'>
                Logout
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
