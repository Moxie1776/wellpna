import { FormControl, MenuItem, Select, Table, Typography } from '@mui/material'
import { useState } from 'react'
import { useMutation, useQuery } from 'urql'

// eslint-disable-next-line max-len
import { UPDATE_USER_ROLE_MUTATION } from '../../graphql/mutations/updateUserRoleMutation'
import { USERS_QUERY } from '../../graphql/queries/usersQuery'
import { useAuthStore } from '../../store/auth'
import logger from '../../utils/logger'

interface User {
  id: string
  email: string
  name: string
  phoneNumber: string
  role: string
  registeredAt: string
}

export const UserManagementTable = () => {
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { user: currentUser } = useAuthStore()

  const [{ data, fetching, error: queryError }, refetchUsers] = useQuery({
    query: USERS_QUERY,
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
        <Typography variant="h1" sx={{ color: 'error.main' }}>
          Error
        </Typography>
        <Typography variant="body1">{queryError.message}</Typography>
      </>
    )
  }

  const users: User[] = data?.users || []

  return (
    <>
      {error && (
        <Typography variant="body2" sx={{ color: 'error.main', mb: 2 }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography variant="body2" sx={{ color: 'success.main', mb: 2 }}>
          {success}
        </Typography>
      )}

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>
                <FormControl size="small">
                  <Select
                    value={user.role}
                    onChange={(event) => {
                      const value = event.target.value as string
                      if (value && value !== user.role) {
                        handleRoleChange(user.id, value)
                      }
                    }}
                    disabled={updatingUser === user.id}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </td>
              <td>{new Date(user.registeredAt).toLocaleDateString()}</td>
              <td>
                {updatingUser === user.id && (
                  <Typography variant="body2" sx={{ color: 'neutral.main' }}>
                    Updating...
                  </Typography>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
