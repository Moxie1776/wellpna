import { FormControl, Option, Select, Table, Typography } from '@mui/joy'
import { useState } from 'react'
import { useMutation, useQuery } from 'urql'

import {
  UPDATE_USER_ROLE_MUTATION,
} from '../../graphql/mutations/updateUserRoleMutation'
import { USERS_QUERY } from '../../graphql/queries/usersQuery'
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

  const [{ data, fetching, error: queryError }] = useQuery({
    query: USERS_QUERY,
  })

  const [, updateUserRole] = useMutation(UPDATE_USER_ROLE_MUTATION)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUser(userId)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateUserRole({
        userId,
        role: newRole,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to update user role')
        return
      }

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
    return <Typography level="h3">Loading users...</Typography>
  }

  if (queryError) {
    return (
      <>
        <Typography level="h1" color="danger">
          Error
        </Typography>
        <Typography level="body-lg">{queryError.message}</Typography>
      </>
    )
  }

  const users: User[] = data?.users || []

  return (
    <>
      {error && (
        <Typography level="body-sm" color="danger" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography level="body-sm" color="success" sx={{ mb: 2 }}>
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
                <FormControl size="sm">
                  <Select
                    value={user.role}
                    onChange={(_, value) => {
                      if (value && value !== user.role) {
                        handleRoleChange(user.id, value)
                      }
                    }}
                    disabled={updatingUser === user.id}
                    sx={{ minWidth: 120 }}
                  >
                    <Option value="user">User</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </FormControl>
              </td>
              <td>{new Date(user.registeredAt).toLocaleDateString()}</td>
              <td>
                {updatingUser === user.id && (
                  <Typography level="body-sm" color="neutral">
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
