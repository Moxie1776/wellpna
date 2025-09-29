import { useNavigate } from 'react-router-dom';
import { SignInForm } from '@/components/public/SignInForm';
import { useTheme } from '@/providers/theme-provider';

const HomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className='min-h-[80vh] flex items-center justify-center p-8'>
      <div className='flex flex-col lg:p-20 justify-center items-center w-full h-full p-10'>
        {/* Left side - Illustration */}
        <div className='item-center text-center'>
          <h1 className='scroll-m-20 text-center text-4xl text-primary font-extrabold tracking-tight text-balance'>
            WellPNA
          </h1>
          <h3 className='scroll-m-20 text-2xl text-secondary font-semibold tracking-tight'>
            Well Plug & Abandonment Solutions
          </h3>
        </div>
        <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
          <div className='flex-1 flex justify-center'>
            <img
              src='/src/assets/cybergedeon_no_shale_gas_red.svg'
              alt='Well Symbol'
              width={300}
              height={300}
              className={`w-80 h-80 max-w-[400px] max-h-[400px] opacity-90 ${
                theme === 'dark' ? 'filter invert' : ''
              }`}
            />
          </div>

          {/* Right side - Signin Card */}
          <div className='flex-1 flex justify-center'>
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
