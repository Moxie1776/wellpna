import { Box, Button, Sheet, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

const Forbidden = () => {
  const navigate = useNavigate()

  return (
    <Sheet
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 600,
        }}
      >
        {/* Illustration */}
        <Box sx={{ mb: 4, maxWidth: 400 }}>
          <img
            src="/errors/403-forbidden.png"
            alt="Access forbidden"
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Typography level="h1" sx={{ mb: 2 }}>
          403 - Access Forbidden
        </Typography>

        <Typography level="body-lg" sx={{ mb: 4, color: 'text.secondary' }}>
          You don't have permission to access this page.
        </Typography>

        <Button size="lg" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Sheet>
  )
}

export default Forbidden
