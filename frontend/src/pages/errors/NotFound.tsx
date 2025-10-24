import { Box, Button, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Paper
      elevation={6}
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
            src="/errors/404-not-found.png"
            alt="Page not found"
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Typography variant="h1" sx={{ mb: 2 }}>
          404 - Page Not Found
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'textSecondary' }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Button size="large" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Paper>
  )
}

export default NotFound
