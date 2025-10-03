/* eslint-disable max-len */
import { Box, Card, CardContent, Sheet, Stack } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { SignInForm } from '@/components/public/SignInForm'
import { useMode } from '@/hooks/useMode'

const HomePage = () => {
  const navigate = useNavigate()
  const { mode } = useMode()

  return (
    <Sheet
      sx={{
        varient: 'plain',
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, lg: 6 },
        }}
      >
        {/* Header section with title and subtitle */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
          }}
        >
          <h1
            className="scroll-m-20 text-center text-4xl text-primary font-extrabold
            tracking-tight text-balance"
          >
            WellPNA
          </h1>
          <h3
            className="scroll-m-20 text-2xl text-secondary font-semibold
            tracking-tight"
          >
            Well Plug & Abandonment Solutions
          </h3>
        </Box>

        {/* Main content with image and sign-in form */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Left side - Illustration */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src="/src/assets/cybergedeon_no_shale_gas_red.svg"
              alt="Well Symbol"
              width={300}
              height={300}
              className={`w-80 h-80 max-w-[400px] max-h-[400px] opacity-90 ${
                mode === 'dark' ? 'filter invert' : ''
              }`}
            />
          </Box>

          {/* Right side - Signin Card */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Card
              color="primary"
              variant="soft"
              sx={{
                minWidth: 300,
                maxWidth: 400,
              }}
            >
              <CardContent>
                <SignInForm
                  title="Access your WellPNA account"
                  onSignIn={() => navigate('/dashboard')}
                />
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Sheet>
  )
}

export default HomePage
