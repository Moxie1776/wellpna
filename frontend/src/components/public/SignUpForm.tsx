import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button } from '@mui/joy'
import Typography from '@mui/joy/Typography'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import RHFInputJoy from '@/components/hook-form/RHFInputJoy'
import { Form, FormControl, FormItem } from '@/components/ui/form'
import passwordSchema from '@/utils/passwordSchema'

import { useAuth } from '../../hooks/useAuth'
import logger from '../../utils/logger'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email({ message: 'Please enter a valid email address' }),
  password: passwordSchema,
})

export const SignUpForm = ({ onSignup }: { onSignup: () => void }) => {
  const { signUp, error } = useAuth()
  logger.debug('SignupForm error:', error)

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  // Helper text state for name, email, and password
  const [nameHelperText, setNameHelperText] = React.useState('Enter your name.')
  const [emailHelperText, setEmailHelperText] = React.useState(
    'Enter your email address.',
  )
  const [passwordHelperText, setPasswordHelperText] = React.useState(
    'Enter your password.',
  )

  React.useEffect(() => {
    if (form.formState.errors.name) {
      setNameHelperText(
        form.formState.errors.name.message || 'Enter your name.',
      )
    } else {
      setNameHelperText('Enter your name.')
    }
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
    form.formState.errors.name,
    form.formState.errors.email,
    form.formState.errors.password,
    form.formState.isSubmitted,
  ])

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signUp(values.email, values.password, values.name)
      onSignup()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handling is done in the useAuth hook
    }
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <Box sx={{ my: 2 }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            Sign Up
          </Typography>
          <FormItem>
            <FormControl>
              <RHFInputJoy
                name="name"
                label="Name"
                type="text"
                helperText={nameHelperText}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormControl>
              <RHFInputJoy
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
              <RHFInputJoy
                name="password"
                label="Password"
                type="password"
                helperText={passwordHelperText}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
          </FormItem>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Sign Up
          </Button>
          {error && (
            <Typography level="body-sm" color="danger" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Form>
    </FormProvider>
  )
}
