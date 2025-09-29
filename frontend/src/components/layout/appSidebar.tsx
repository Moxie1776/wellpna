import { type ComponentProps } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import {
  Home,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Key,
  Mail,
} from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: Home, requiresAuth: false },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiresAuth: true,
  },
  { label: 'Sign In', href: '/login', icon: LogIn, requiresAuth: false },
  { label: 'Sign Up', href: '/signup', icon: UserPlus, requiresAuth: false },
  {
    label: 'Password Reset',
    href: '/reset-password',
    icon: Key,
    requiresAuth: false,
  },
  {
    label: 'Email Verification',
    href: '/verify-email',
    icon: Mail,
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
    ? { label: 'WellPnA', href: '/dashboard', icon: LayoutDashboard }
    : { label: 'WellPnA', href: '/', icon: Home };

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
              <Button variant='outline' onClick={signOut} className='w-full'>
                Logout
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
