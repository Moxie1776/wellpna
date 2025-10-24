import { Paper, Typography } from '@mui/material'

// eslint-disable-next-line max-len
import { UserManagementTable } from '../../components/tables/UserManagementTable'

export const Admin = () => {
  return (
    <Paper
      elevation={6}
      sx={{
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Typography variant="h1" color="primary" sx={{ mb: 3 }}>
        User Management
      </Typography>

      <UserManagementTable />
    </Paper>
  )
}
