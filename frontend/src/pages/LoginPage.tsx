import { LoginForm } from '@/components/LoginForm';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;