import { Button, Sheet, Typography } from '@mui/joy'
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
    <Sheet
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Typography level="h1" color="primary" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Typography level="h3" color="neutral">
        Welcome to the WellPNA Dashboard
      </Typography>
      <Button onClick={handleLogout}>Logout</Button>
    </Sheet>
  )
}
