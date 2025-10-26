import { Paper } from '@mui/material'

// eslint-disable-next-line max-len
import { UserManagementTable } from '../../components/tables/UserManagementTable'
import { PageHeader } from '../../components/ui'

export const Admin = () => {
  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        width: '100%',
      }}
    >
      <PageHeader>User Management</PageHeader>

      <UserManagementTable />
    </Paper>
  )
}
