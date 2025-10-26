import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/hookForm/HFForm'
import HFTextField from '@/components/hookForm/HFTextField'
import { ResetButton, StandardButton } from '@/components/ui'
import passwordSchema from '@/utils/passwordSchema'

import { useAuth } from '../../hooks/useAuth'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email({ message: 'Please enter a valid email address' }),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  password: passwordSchema,
})

export const SignUpForm = ({ onSignup }: { onSignup: () => void }) => {
  const { signUp, error } = useAuth()
  // Debug logs removed: keep error handling via hook

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      const result = await signUp(
        values.email,
        values.password,
        values.name,
        values.phoneNumber,
      )
      // Only call onSignup when signup actually succeeded
      if (result) {
        onSignup()
      }
      // else: error is surfaced via useAuth().error and shown in the form
    } catch (err) {
      // Unexpected errors: ensure they're surfaced (useAuth also logs)
      // Keep silent here since useAuth sets error state for
      // GraphQL/validation issues but still log to console in dev for debug

      console.error('SignUpForm onSubmit unexpected error', err)
    }
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Box sx={{ my: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Sign Up
          </Typography>
          <HFTextField
            label="Name"
            inputId="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            disabled={form.formState.isSubmitting}
          />
          <HFTextField
            label="Email"
            inputId="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            disabled={form.formState.isSubmitting}
          />
          <HFTextField
            label="Phone Number"
            inputId="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            disabled={form.formState.isSubmitting}
          />
          <HFTextField
            label="Password"
            inputId="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            disabled={form.formState.isSubmitting}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <StandardButton
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Sign Up
            </StandardButton>
            <ResetButton
              type="button"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </ResetButton>
          </Box>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Form>
    </FormProvider>
  )
}
