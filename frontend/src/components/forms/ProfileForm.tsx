import { zodResolver } from '@hookform/resolvers/zod'
import { FormControl, FormLabel, TextField, Typography } from '@mui/material'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '../../components/hookForm/HFForm'
import { ResetButton, StandardButton } from '../../components/ui'
import { useUpdateUserMutation } from '../../graphql/generated/graphql'
import { useAuthStore } from '../../store/auth'
import logger from '../../utils/logger'
import HFTextField from '../hookForm/HFTextField'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
})

interface ProfileFormProps {
  user: {
    id: string
    email: string
    name: string
    phoneNumber: string
  } | null
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [success, setSuccess] = React.useState(false)

  const [result, updateUser] = useUpdateUserMutation()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setSuccess(false)

    try {
      const mutationResult = await updateUser({
        data: {
          name: values.name.trim(),
          phoneNumber: values.phoneNumber.trim(),
        },
      })

      if (mutationResult.error) {
        logger.error('Profile update error:', mutationResult.error)
        return
      }

      // Update Zustand auth store with new user data if available
      if (mutationResult.data?.updateUser) {
        useAuthStore.getState().updateUser({
          id: mutationResult.data.updateUser.id || '',
          email: mutationResult.data.updateUser.email || '',
          name: mutationResult.data.updateUser.name || '',
          phoneNumber: mutationResult.data.updateUser.phoneNumber || '',
          role: mutationResult.data.updateUser.role || '',
        })
      }

      setSuccess(true)
      logger.info('Profile updated successfully')
    } catch (err: any) {
      logger.error('Profile update error:', err)
    }
  }

  const onReset = () => {
    form.reset()
    setSuccess(false)
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <TextField
            type="email"
            value={user?.email || ''}
            disabled
            sx={{ backgroundColor: 'background.paper' }}
          />
        </FormControl>

        <HFTextField
          label="Name"
          inputId="name"
          name="name"
          type="text"
          placeholder="Enter your name"
          disabled={result.fetching}
        />

        <HFTextField
          label="Phone Number"
          inputId="phoneNumber"
          name="phoneNumber"
          type="tel"
          placeholder="Enter your phone number"
          disabled={result.fetching}
        />

        {result.error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {result.error.message || 'Failed to update profile'}
          </Typography>
        )}

        {success && (
          <Typography variant="body2" color="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Typography>
        )}

        <StandardButton
          type="submit"
          disabled={result.fetching}
          sx={{ mb: 2, mr: 1, minWidth: 120 }}
          children="Update Profile"
        />

        <ResetButton
          type="button"
          onClick={onReset}
          disabled={result.fetching}
          sx={{ mb: 2, ml: 1, minWidth: 120 }}
          children="Reset"
        />
      </Form>
    </FormProvider>
  )
}
