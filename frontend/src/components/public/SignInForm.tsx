import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Typography } from '@mui/material'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Form } from '@/components/hookForm/HFForm'
import HFTextField from '@/components/hookForm/HFTextField'
import { ResetButton, StandardButton } from '@/components/ui'

import { useAuth } from '../../hooks/useAuth'

const signInSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, 'Password is required'),
})

export const SignInForm = ({
  onSignIn,
  title = 'Sign In',
}: {
  onSignIn?: () => void
  title?: string
}) => {
  const { signIn, error } = useAuth()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (error?.includes('Email not verified')) {
      const email = form.getValues('email')
      if (email) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    }
  }, [error, navigate, form])

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const result = await signIn(values.email, values.password)
    if (result) {
      onSignIn?.()
    } else if (error?.includes('Email not verified')) {
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`)
    }
  }

  return (
    <FormProvider {...form}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <HFTextField
            label="Email"
            inputId="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
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
              Sign In
            </StandardButton>
            <ResetButton
              type="button"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </ResetButton>
          </Box>
        </Form>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </FormProvider>
  )
}
