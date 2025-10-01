import { useNavigate } from 'react-router-dom';

import { SignInForm } from '@/components/public/SignInForm';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/');
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <SignInForm onSignIn={handleSignIn} />
    </div>
  );
};

export default SignInPage;
