import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { useAuthStore } from '@/store/auth';
import { Moon, Sun } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileMenuButton } from './MobileMenuButton';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { token, clearAuth } = useAuthStore();
  const isAuthenticated = !!token;

  const isHomePage = location.pathname === '/';

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbs = [
      { name: 'Home', href: '/', current: pathnames.length === 0 },
    ];

    if (pathnames.length > 0) {
      pathnames.forEach((pathname, index) => {
        const href = '/' + pathnames.slice(0, index + 1).join('/');
        const name = pathname.charAt(0).toUpperCase() + pathname.slice(1);
        const current = index === pathnames.length - 1;

        breadcrumbs.push({ name, href, current });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      {/* Mobile menu button only on small screens */}
      <div className='fixed top-4 left-4 z-50 md:hidden'>
        <MobileMenuButton />
      </div>
      <Sidebar>
        <div className='flex flex-col h-full'>
          {/* Top of sidebar: Home button left, theme toggle right */}
          <div className='flex items-center justify-between px-4 py-4 border-b'>
            <Link to='/' className='text-lg font-bold'>
              Home
            </Link>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-10 h-10 p-0 ${
                theme === 'light'
                  ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                  : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              <Sun className='h-5 w-5 transition-all dark:-rotate-90 dark:scale-0' />
              <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
              <span className='sr-only'>Toggle theme</span>
            </Button>
          </div>
          {/* Nav links below top row */}
          <div className='flex-1 overflow-y-auto px-4 py-2'>
            <Navbar isAuthenticated={isAuthenticated} clearAuth={clearAuth} />
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <div className='flex-1 overflow-auto w-full h-full p-10 pt-15'>
          {!isHomePage && (
            <div className='px-4 py-2'>
              <Breadcrumb>
                <BreadcrumbList className='flex items-center space-x-2 overflow-x-auto'>
                  {breadcrumbs.map((bc, i) => (
                    <div
                      key={bc.href}
                      className='flex items-center flex-shrink-0'
                    >
                      {i > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {bc.current ? (
                          <BreadcrumbPage>{bc.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={bc.href}>{bc.name}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          <main
            className={`${
              isHomePage ? 'w-full' : 'w-full max-w-4xl mx-auto px-4 py-8'
            }`}
          >
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
