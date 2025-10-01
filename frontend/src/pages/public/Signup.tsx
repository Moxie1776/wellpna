import { useNavigate } from 'react-router-dom';

import { SignUpForm } from '@/components/public/SignUpForm';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/login');
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <SignUpForm onSignup={handleSignup} />
    </div>
  );
};

export default SignupPage;
