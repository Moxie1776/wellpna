import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mui/material'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormControl, FormItem } from '@/components/hookForm/HFForm'
import HFInput from '@/components/hookForm/HFTextField'
import { passwordSchema } from '@/utils/'

// logger removed: no longer used for transient debug in this form

const requestResetSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
})

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Code must be 6 digits'),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    // eslint-disable-next-line quotes
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function PasswordResetForm({
  mode,
  defaultEmail = '',
  defaultCode = '',
  onRequestReset,
  onResetPassword,
}: {
  mode: 'request' | 'reset'
  defaultEmail?: string
  defaultCode?: string
  onRequestReset?: (values: { email: string }) => void
  onResetPassword?: (values: {
    code: string
    newPassword: string
    confirmPassword: string
  }) => void
}) {
  const requestForm = useForm<z.infer<typeof requestResetSchema>>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: defaultEmail },
    mode: 'onChange',
  })
  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: defaultCode, newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  })

  // Helper text state for request and reset forms
  const [emailHelperText, setEmailHelperText] = React.useState(
    'Enter your email address.',
  )
  const [codeHelperText, setCodeHelperText] = React.useState(
    'Enter 6-digit code.',
  )
  const [newPasswordHelperText, setNewPasswordHelperText] = React.useState(
    'Enter new password.',
  )
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] =
    React.useState('Confirm new password.')

  React.useEffect(() => {
    if (requestForm.formState.errors.email) {
      setEmailHelperText(
        requestForm.formState.errors.email.message ||
          'Enter your email address.',
      )
    } else {
      setEmailHelperText('Enter your email address.')
    }
    if (resetForm.formState.errors.code) {
      setCodeHelperText(
        resetForm.formState.errors.code.message || 'Enter 6-digit code.',
      )
    } else {
      setCodeHelperText('Enter 6-digit code.')
    }
    if (resetForm.formState.errors.newPassword) {
      setNewPasswordHelperText(
        resetForm.formState.errors.newPassword.message || 'Enter new password.',
      )
    } else {
      setNewPasswordHelperText('Enter new password.')
    }
    if (resetForm.formState.errors.confirmPassword) {
      setConfirmPasswordHelperText(
        resetForm.formState.errors.confirmPassword.message ||
          'Confirm new password.',
      )
    } else {
      setConfirmPasswordHelperText('Confirm new password.')
    }
  }, [
    requestForm.formState.errors.email,
    resetForm.formState.errors.code,
    resetForm.formState.errors.newPassword,
    resetForm.formState.errors.confirmPassword,
    requestForm.formState.isSubmitted,
    requestForm.formState.isLoading,
    resetForm.formState.isSubmitted,
    resetForm.formState.isLoading,
  ])

  return mode === 'request' ? (
    <FormProvider {...requestForm}>
      <Form
        onSubmit={requestForm.handleSubmit((data) => {
          if (onRequestReset) {
            onRequestReset(data)
          }
        })}
      >
        <FormItem>
          <FormControl>
            <HFInput
              name="email"
              label="Email"
              type="email"
              helperText={emailHelperText}
              data-testid="email-input"
            />
          </FormControl>
        </FormItem>
        <Button
          type="submit"
          disabled={requestForm.formState.isLoading}
          data-testid="request-submit-button"
        >
          {requestForm.formState.isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </Form>
    </FormProvider>
  ) : (
      <FormProvider {...resetForm}>
      <Form
        onSubmit={resetForm.handleSubmit((data) => {
          if (onResetPassword) {
            onResetPassword(data)
          }
        })}
      >
        {/* hidden email field to capture autofill */}
        <input
          type="email"
          name="_email"
          autoComplete="email"
          style={{ display: 'none' }}
        />

        {/* <FormItem>
          <FormControl>
            <HFInput
              name="email"
              label="Email"
              type="text"
              helperText={emailHelperText}
              disabled={true}
            />
          </FormControl>
        </FormItem> */}
        <FormItem>
          <FormControl>
            <HFInput
              name="code"
              label="Verification Code"
              type="text"
              helperText={codeHelperText}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormControl>
            <HFInput
              name="newPassword"
              label="New Password"
              type="password"
              helperText={newPasswordHelperText}
            />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormControl>
            <HFInput
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              helperText={confirmPasswordHelperText}
              placeholder="Confirm new password"
            />
          </FormControl>
        </FormItem>
        <Button
          type="submit"
          disabled={resetForm.formState.isLoading}
          data-testid="reset-submit-button"
        >
          {resetForm.formState.isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Form>
    </FormProvider>
  )
}
