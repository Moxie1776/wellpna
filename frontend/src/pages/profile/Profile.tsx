import { Box, Paper, Typography } from '@mui/material'

import { ProfileForm } from '../../components/forms/ProfileForm'
import { useAuth } from '../../hooks/useAuth'

export const Profile = () => {
  const { user } = useAuth()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
        elevation={6}
      >
        <Typography
          variant="h1"
          color="primary"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          Profile
        </Typography>

        <ProfileForm user={user} />
      </Paper>
    </Box>
  )
}
