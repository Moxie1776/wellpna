import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
      <SidebarTrigger className='sm:hidden' />
      <Link to='/' className='text-lg font-bold md:hidden'>
        Home
      </Link>
      <div className='relative ml-auto flex-1 md:grow-0'>
        {/* Theme toggle */}
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
    </header>
  );
}
