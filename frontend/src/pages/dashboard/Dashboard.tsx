import { Button, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import logger from '../../utils/logger'

export const Dashboard = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      logger.error('Dashboard logout error', err)
    }
    navigate('/signin')
  }

  return (
    <Paper
      elevation={6}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Typography variant="h1" color="primary" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Typography variant="h3" color="neutral">
        Welcome to the WellPNA Dashboard
      </Typography>
      <Button onClick={handleLogout}>Logout</Button>
    </Paper>
  )
}
