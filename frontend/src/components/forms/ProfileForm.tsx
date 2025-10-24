import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormItem } from '../../components/hookForm/HFForm'
import HFInput from '../hookForm/HFTextField'
import { useUpdateUserMutation } from '../../graphql/generated/graphql'
import { useAuthStore } from '../../store/auth'
import logger from '../../utils/logger'

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

  // Helper text state for name and phoneNumber
  const [nameHelperText, setNameHelperText] = React.useState('Enter your name.')
  const [phoneNumberHelperText, setPhoneNumberHelperText] = React.useState(
    'Enter your phone number.',
  )

  useEffect(() => {
    if (form.formState.errors.name) {
      setNameHelperText(
        form.formState.errors.name.message || 'Enter your name.',
      )
    } else {
      setNameHelperText('Enter your name.')
    }
    if (form.formState.errors.phoneNumber) {
      setPhoneNumberHelperText(
        form.formState.errors.phoneNumber.message || 'Enter your phone number.',
      )
    } else {
      setPhoneNumberHelperText('Enter your phone number.')
    }
  }, [
    form.formState.errors.name,
    form.formState.errors.phoneNumber,
    form.formState.isSubmitted,
  ])

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

        <FormItem>
          <FormControl>
            <HFInput
              name="name"
              label="Name"
              type="text"
              helperText={nameHelperText}
              disabled={result.fetching}
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormControl>
            <HFInput
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              helperText={phoneNumberHelperText}
              disabled={result.fetching}
            />
          </FormControl>
        </FormItem>

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

        <Button
          type="submit"
          disabled={result.fetching}
          fullWidth
          sx={{ mb: 2 }}
        >
          Update Profile
        </Button>
      </Form>
    </FormProvider>
  )
}
