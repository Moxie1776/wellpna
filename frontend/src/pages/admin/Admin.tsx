import { Sheet, Typography } from '@mui/joy'

import {
  UserManagementTable,
} from '../../components/tables/UserManagementTable'
import { useAuth } from '../../hooks/useAuth'

export const Admin = () => {
  const { user: currentUser } = useAuth()

  if (currentUser?.role !== 'admin') {
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
        <Typography level="h1" color="danger">
          Access Denied
        </Typography>
        <Typography level="body-lg">
          You do not have permission to access this page.
        </Typography>
      </Sheet>
    )
  }

  return (
    <Sheet
      sx={{
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Typography level="h1" color="primary" sx={{ mb: 3 }}>
        User Management
      </Typography>

      <UserManagementTable />
    </Sheet>
  )
}
