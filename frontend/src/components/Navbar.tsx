import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { navLinks } from './navLinks';

interface NavbarProps {
  isAuthenticated: boolean;
  clearAuth: () => void;
}

export function Navbar({ isAuthenticated, clearAuth }: NavbarProps) {
  return (
    <nav className='flex space-x-4 overflow-x-auto px-2'>
      {navLinks.map((link) => {
        if (link.auth === undefined || link.auth === isAuthenticated) {
          return (
            <Link
              key={link.to}
              to={link.to}
              className='text-sm font-medium hover:underline'
            >
              {link.label}
            </Link>
          );
        }
        return null;
      })}
      {isAuthenticated && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            clearAuth();
            window.location.href = '/';
          }}
          className='text-sm font-medium h-auto p-0 hover:underline'
        >
          Logout
        </Button>
      )}
    </nav>
  );
}
