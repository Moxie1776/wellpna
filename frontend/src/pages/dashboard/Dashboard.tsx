import { Button, Sheet, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

export const Dashboard = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login')
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
