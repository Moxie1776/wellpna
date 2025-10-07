import { Box, Card, CardContent, Sheet, Stack, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { SignInForm } from '@/components/public/SignInForm'
import { useIsMobile } from '@/hooks/useMobile'
import { useModeStore } from '@/store/theme'

const HomePage = () => {
  const navigate = useNavigate()
  const { mode } = useModeStore()
  const isMobile = useIsMobile()
  const primaryColor =
    mode === 'dark'
      ? 'var(--joy-palette-primary-light)'
      : 'var(--joy-palette-primary-dark)'
  const secondaryColor =
    mode === 'dark'
      ? 'var(--joy-palette-secondary-light)'
      : 'var(--joy-palette-secondary-dark)'

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
              color: primaryColor,
            }}
          >
            WellPNA
          </Typography>
          <Typography
            level="h3"
            sx={{
              color: secondaryColor,
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
            <img
              className="filter-green"
              src="/villahermosa2.2-removebg-preview.png"
              alt="villahermosa2.2"
              style={{ maxWidth: isMobile ? '300px' : '555px', height: 'auto' }}
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
