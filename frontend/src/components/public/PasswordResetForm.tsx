import { zodResolver } from '@hookform/resolvers/zod'
import { Box } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/hookForm/HFForm'
import HFTextField from '@/components/hookForm/HFTextField'
import { ResetButton, StandardButton } from '@/components/ui'
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

  return mode === 'request' ? (
    <FormProvider {...requestForm}>
      <Form
        onSubmit={requestForm.handleSubmit((data) => {
          if (onRequestReset) {
            onRequestReset(data)
          }
        })}
      >
        <HFTextField
          label="Email"
          inputId="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          data-testid="email-input"
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <StandardButton
            type="submit"
            disabled={requestForm.formState.isSubmitting}
            data-testid="request-submit-button"
          >
            {requestForm.formState.isSubmitting
              ? 'Sending...'
              : 'Send Reset Code'}
          </StandardButton>
          <ResetButton
            type="button"
            onClick={() => requestForm.reset()}
            disabled={requestForm.formState.isSubmitting}
          >
            Reset
          </ResetButton>
        </Box>
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

        <HFTextField
          label="Email"
          inputId="email"
          name="email"
          type="text"
          disabled={true}
          sx={{ display: 'none' }}
        />
        <HFTextField
          label="Verification Code"
          inputId="code"
          name="code"
          type="text"
          placeholder="Enter 6-digit code"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        <HFTextField
          label="New Password"
          inputId="newPassword"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
        />
        <HFTextField
          label="Confirm Password"
          inputId="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <StandardButton
            type="submit"
            disabled={resetForm.formState.isSubmitting}
            data-testid="reset-submit-button"
          >
            {resetForm.formState.isSubmitting
              ? 'Resetting...'
              : 'Reset Password'}
          </StandardButton>
          <ResetButton
            type="button"
            onClick={() => resetForm.reset()}
            disabled={resetForm.formState.isSubmitting}
          >
            Reset
          </ResetButton>
        </Box>
      </Form>
    </FormProvider>
  )
}
