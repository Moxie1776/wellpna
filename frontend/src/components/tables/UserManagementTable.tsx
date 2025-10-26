import {
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { useMutation, useQuery } from 'urql'

// eslint-disable-next-line max-len
import { UPDATE_USER_ROLE_MUTATION } from '../../graphql/mutations/updateUserRoleMutation'
import { USER_ROLES_QUERY, USERS_QUERY } from '../../graphql/queries'
import { useAuthStore } from '../../store/auth'
import { ftDateTime } from '../../utils'
import logger from '../../utils/logger'

interface User {
  id: string
  email: string
  name: string
  phoneNumber: string
  role: string
  registeredAt: string
  validatedAt?: string
  operatorUsers?: Array<{
    operator?: {
      operatorEnum?: string
    }
  }>
}

export const UserManagementTable = () => {
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { user: currentUser } = useAuthStore()

  const [{ data, fetching, error: queryError }, refetchUsers] = useQuery({
    query: USERS_QUERY,
  })

  const [{ data: rolesData }] = useQuery({
    query: USER_ROLES_QUERY,
  })

  const [, updateUserRole] = useMutation(UPDATE_USER_ROLE_MUTATION)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUser(userId)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateUserRole({
        data: {
          userId,
          role: newRole,
        },
      })

      if (result.error) {
        setError(result.error.message || 'Failed to update user role')
        return
      }

      // If the current user changed their own role
      if (currentUser && currentUser.id === userId) {
        // Update Zustand auth store with new user data if available
        if (result.data?.updateUserRole) {
          useAuthStore.getState().updateUser(result.data.updateUserRole)
        }
        return
      }

      // For other users, refetch the users list to update the table
      await refetchUsers({ requestPolicy: 'network-only' })
      setSuccess('User role updated successfully')
      logger.info('User role updated', { userId, newRole })
    } catch (err: any) {
      logger.error('Role update error', err)
      setError(err.message || 'An error occurred while updating role')
    } finally {
      setUpdatingUser(null)
    }
  }

  if (fetching) {
    return <Typography variant="h3">Loading users...</Typography>
  }

  if (queryError) {
    return (
      <>
        <Typography variant="h1" color="error">
          Error
        </Typography>
        <Typography variant="body1">{queryError.message}</Typography>
      </>
    )
  }

  const users: User[] = data?.users || []

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phoneNumber', headerName: 'Phone', width: 150 },
    {
      field: 'companies',
      headerName: 'Companies',
      width: 200,
      valueGetter: (_value, row) => {
        const operatorUsers = row.operatorUsers
        if (!operatorUsers || operatorUsers.length === 0) return 'None'
        const companies = operatorUsers
          .map((ou: any) => ou.operator?.operatorEnum)
          .filter(Boolean)
        return companies.length > 0 ? companies.join(', ') : 'None'
      },
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <FormControl
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              height: '30px',
            },
            pt: 1,
          }}
        >
          <Select
            variant="filled"
            value={params.value}
            onChange={(event) => {
              const value = event.target.value
              if (value && value !== params.value) {
                handleRoleChange(params.id as string, value)
              }
            }}
            disabled={updatingUser === params.id}
            sx={{ minWidth: 100 }}
          >
            {rolesData?.userRoles?.map((role: { role: string }) => (
              <MenuItem key={role.role} value={role.role}>
                {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      field: 'registeredAt',
      headerName: 'Registered',
      width: 150,
      valueFormatter: (value) => ftDateTime(value),
    },
    {
      field: 'validatedAt',
      headerName: 'Validated',
      width: 150,
      valueFormatter: (value) => {
        if (!value) return 'Not validated'
        return ftDateTime(value)
      },
    },
  ]

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    registeredAt: user.registeredAt,
    validatedAt: user.validatedAt,
  }))

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography variant="body2" color="success" sx={{ mb: 2 }}>
          {success}
        </Typography>
      )}

      <Paper elevation={8}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
        />
      </Paper>
    </Box>
  )
}
