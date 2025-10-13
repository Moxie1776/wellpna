import { Button, FormControl, FormLabel, Input, Typography } from '@mui/joy'
import { useState } from 'react'
import { useMutation } from 'urql'

import {
  UPDATE_USER_MUTATION,
} from '../../graphql/mutations/updateUserMutation'
import logger from '../../utils/logger'

interface ProfileFormProps {
  user: {
    id: number
    email: string
    name: string
    phoneNumber: string
  } | null
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [name, setName] = useState(user?.name || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [, updateUser] = useMutation(UPDATE_USER_MUTATION)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateUser({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
      })

      if (result.error) {
        setError(result.error.message || 'Failed to update profile')
        return
      }

      setSuccess(true)
      logger.info('Profile updated successfully')
    } catch (err: any) {
      logger.error('Profile update error', err)
      setError(err.message || 'An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={user?.email || ''}
          disabled
          sx={{ backgroundColor: 'background.level1' }}
        />
      </FormControl>

      <FormControl sx={{ mb: 2 }}>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </FormControl>

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Phone Number</FormLabel>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter your phone number"
          required
        />
      </FormControl>

      {error && (
        <Typography level="body-sm" color="danger" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography level="body-sm" color="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Typography>
      )}

      <Button type="submit" loading={loading} fullWidth sx={{ mb: 2 }}>
        Update Profile
      </Button>
    </form>
  )
}
