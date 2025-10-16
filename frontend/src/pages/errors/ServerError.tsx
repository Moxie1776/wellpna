import { Box, Button, Sheet, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

const ServerError = () => {
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
            src="/errors/500-internal-server-error.png"
            alt="Server error"
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Typography level="h1" sx={{ mb: 2 }}>
          500 - Server Error
        </Typography>

        <Typography level="body-lg" sx={{ mb: 4, color: 'text.secondary' }}>
          Something went wrong on our end. Please try again later.
        </Typography>

        <Button size="lg" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Sheet>
  )
}

export default ServerError
