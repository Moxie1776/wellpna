import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button } from '@mui/joy'
import Typography from '@mui/joy/Typography'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormControl, FormItem } from '@/components/hookForm/HFForm'
import HFInput from '@/components/hookForm/HFInput'
import passwordSchema from '@/utils/passwordSchema'

import { useAuth } from '../../hooks/useAuth'
import logger from '../../utils/logger'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email({ message: 'Please enter a valid email address' }),
  phoneNumber: z.string().min(1, 'Phone number is required'),
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
      phoneNumber: '',
      password: '',
    },
    mode: 'onChange',
  })

  // Helper text state for name, email, phone number, and password
  const [nameHelperText, setNameHelperText] = React.useState('Enter your name.')
  const [emailHelperText, setEmailHelperText] = React.useState(
    'Enter your email address.',
  )
  const [phoneNumberHelperText, setPhoneNumberHelperText] = React.useState(
    'Enter your phone number.',
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
    if (form.formState.errors.phoneNumber) {
      setPhoneNumberHelperText(
        form.formState.errors.phoneNumber.message || 'Enter your phone number.',
      )
    } else {
      setPhoneNumberHelperText('Enter your phone number.')
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
    form.formState.errors.phoneNumber,
    form.formState.errors.password,
    form.formState.isSubmitted,
  ])

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    logger.debug('SignUpForm submit', values)
    try {
      await signUp(
        values.email,
        values.password,
        values.name,
        values.phoneNumber,
      )
      logger.debug(
        'SignUpForm signUp callback called',
        values.email,
        values.password,
        values.name,
      )
      onSignup()
      logger.debug('SignUpForm onSignup callback called')
    } catch (err) {
      logger.debug('SignUpForm error in submit', err)
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
              <HFInput
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
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                helperText={phoneNumberHelperText}
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
