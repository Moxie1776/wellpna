import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
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
  );
}
