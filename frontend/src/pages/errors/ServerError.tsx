import { Box, Button, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const ServerError = () => {
  const navigate = useNavigate()

  return (
    <Paper
      elevation={8}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
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

        <Typography variant="h1" sx={{ mb: 2 }}>
          500 - Server Error
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'textSecondary' }}>
          Something went wrong on our end. Please try again later.
        </Typography>

        <Button size="large" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Paper>
  )
}

export default ServerError
