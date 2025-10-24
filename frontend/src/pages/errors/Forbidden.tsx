import { Box, Button, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Forbidden = () => {
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
            src="/errors/403-forbidden.png"
            alt="Access forbidden"
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        <Typography variant="h1" sx={{ mb: 2 }}>
          403 - Access Forbidden
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'textSecondary' }}>
          You don't have permission to access this page.
        </Typography>

        <Button size="large" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Paper>
  )
}

export default Forbidden
