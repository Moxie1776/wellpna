import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
      <p className='mb-4'>Welcome to the WellPNA Dashboard</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};
