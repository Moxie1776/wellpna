import { Box, Card, CardContent, Sheet, Stack, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { SignInForm } from '@/components/public/SignInForm'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <Sheet
      sx={{
        varient: 'plain',
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
          <Typography
            level="h1"
            sx={{
              fontSize: '2.25rem',
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              textWrap: 'balance',
            }}
          >
            WellPNA
          </Typography>
          <Typography
            level="h3"
            sx={{
              fontSize: '1.5rem',
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '-0.025em',
            }}
          >
            Well Plug & Abandonment Solutions
          </Typography>
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
            <svg
              width={300}
              height={300}
              color="white"
              path="../../assets/cybergedeon_no_shale_gas_red.svg"
            ></svg>
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
                  title="Sign in to your account"
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
