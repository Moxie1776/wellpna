import { useSidebar } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileMenuButton() {
  const { open, setOpen } = useSidebar();
  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label='Open menu'
      onClick={() => setOpen(!open)}
      className='w-10 h-10 p-0'
    >
      <Menu className='h-6 w-6' />
    </Button>
  );
}
