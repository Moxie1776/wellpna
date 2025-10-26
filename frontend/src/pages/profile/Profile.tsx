import { Card, CardContent } from '@mui/material'

import { ProfileForm } from '../../components/forms/ProfileForm'
import { PageHeader } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'

export const Profile = () => {
  const { user } = useAuth()

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 400,
      }}
      role="region"
    >
      <CardContent>
        <PageHeader sx={{ textAlign: 'center' }}>Profile</PageHeader>
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  )
}
