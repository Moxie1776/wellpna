import { Sheet, Typography } from '@mui/joy'

import { ProfileForm } from '../../components/forms/ProfileForm'
import { useAuth } from '../../hooks/useAuth'

export const Profile = () => {
  const { user } = useAuth()

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
      <Sheet
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          borderRadius: 'md',
          boxShadow: 'md',
        }}
        variant="outlined"
      >
        <Typography
          level="h1"
          color="primary"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          Profile
        </Typography>

        <ProfileForm user={user} />
      </Sheet>
    </Sheet>
  )
}
