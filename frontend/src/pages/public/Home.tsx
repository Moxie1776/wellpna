import { useNavigate } from 'react-router-dom';
import { SignInForm } from '@/components/public/SignInForm';
import { useTheme } from '@/providers/theme-provider';

const HomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className='min-h-[80vh] flex items-center justify-center p-8'>
      <div className='flex flex-col lg:p-20 justify-center w-full h-full p-10'>
        {/* Left side - Illustration */}
        <div className='item-center text-center'>
          <h1 className='text-4xl font-bold text-primary mt-6 mb-2'>WellPNA</h1>
          <p className='text-xl text-secondary text-center'>
            Well Plug & Abandonment Solutions
          </p>
        </div>
        <div className='mt-20 flex md:flex-row items-center justify-center'>
          <div className='items-center justify-center max-w-[300px] w-full pb-10'>
            <img
              src='/src/assets/cybergedeon_no_shale_gas_red.svg'
              alt='Well Symbol'
              className={`w-80 h-80 max-w-[400px] max-h-[400px] opacity-90 ${
                theme === 'dark' ? 'filter invert' : ''
              }`}
            />
          </div>

          <div className='w-[80px]'></div>

          {/* Right side - Signin Card */}
          <div className='max-w-[400px] w-full h-full ml-32'>
            <SignInForm
              title='Access your WellPNA account'
              onSignIn={() => navigate('/dashboard')}
              showCard={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
