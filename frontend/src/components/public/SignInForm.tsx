import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Typography } from '@mui/joy'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { MdLogin } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Form, FormControl, FormItem } from '@/components/hookForm/HFForm'
import HFInput from '@/components/hookForm/HFInput'

import { useAuth } from '../../hooks/useAuth'
import logger from '../../utils/logger'

const signInSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, 'Password is required'),
})

export const SignInForm = ({
  onSignIn,
  title = 'Sign In',
}: {
  onSignIn: () => void
  title?: string
}) => {
  const { signIn, error } = useAuth()
  const navigate = useNavigate()
  logger.debug('SignInForm error:', error)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  // Helper text state for email and password
  const [emailHelperText, setEmailHelperText] = React.useState(
    'Enter your email address.',
  )
  const [passwordHelperText, setPasswordHelperText] = React.useState(
    'Enter your password.',
  )

  React.useEffect(() => {
    if (form.formState.errors.email) {
      setEmailHelperText(
        form.formState.errors.email.message || 'Enter your email address.',
      )
    } else {
      setEmailHelperText('Enter your email address.')
    }
    if (form.formState.errors.password) {
      setPasswordHelperText(
        form.formState.errors.password.message || 'Enter your password.',
      )
    } else {
      setPasswordHelperText('Enter your password.')
    }
  }, [
    form.formState.errors.email,
    form.formState.errors.password,
    form.formState.isSubmitted,
  ])

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    logger.debug('SignInForm submit', values)
    try {
      await signIn(values.email, values.password)
      logger.debug(
        'SignInForm signIn callback called',
        values.email,
        values.password,
      )
      onSignIn()
      logger.debug('SignInForm onSignIn callback called')
    } catch (error: any) {
      logger.debug('SignInForm error in submit', error)
      // Check if email is not verified
      if (error?.message?.includes('Email not verified')) {
        navigate(
          `/email-verification?email=${encodeURIComponent(values.email)}`,
        )
      }
      // Error handling is done in the useAuth hook
    }
  }

  return (
    <FormProvider {...form}>
      <Box sx={{ minWidth: 300, maxWidth: 400 }}>
        <Typography level="h4" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormItem>
            <FormControl>
              <HFInput
                name="email"
                label="Email"
                type="email"
                helperText={emailHelperText}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormControl>
              <HFInput
                name="password"
                label="Password"
                type="password"
                helperText={passwordHelperText}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
          </FormItem>
          <Button
            type="submit"
            startDecorator={<MdLogin />}
            disabled={form.formState.isSubmitting}
          >
            Sign In
          </Button>
        </Form>
        {error && (
          <Typography level="body-sm" color="danger" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </FormProvider>
  )
}
