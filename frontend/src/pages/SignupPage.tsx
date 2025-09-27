import { SignupForm } from '@/components/SignupForm';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <SignupForm onSignup={handleSignup} />
    </div>
  );
};

export default SignupPage;