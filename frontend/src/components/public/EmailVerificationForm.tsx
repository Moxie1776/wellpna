import { zodResolver } from '@hookform/resolvers/zod'
import { Box } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/hookForm/HFForm'
import HFTextField from '@/components/hookForm/HFTextField'
import { ResetButton, StandardButton } from '@/components/ui'

// logger removed: no longer used for transient debug in this form

const emailVerificationSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
})

export const EmailVerificationForm = ({
  onVerify,
  onResendCode,
  defaultEmail = '',
}: {
  onVerify: (values: { email: string; code: string }) => void
  onResendCode: (email: string) => void
  defaultEmail?: string
}) => {
  const form = useForm<z.infer<typeof emailVerificationSchema>>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: defaultEmail,
      code: '',
    },
    mode: 'onChange',
  })

  const onSubmit = form.handleSubmit((data) => {
    onVerify({
      email: data.email,
      code: data.code,
    })
  })

  const handleResend = () => {
    const email = form.getValues('email')
    onResendCode(email)
  }

  return (
    <FormProvider {...form}>
      <Form onSubmit={onSubmit}>
        <HFTextField
          label="Email"
          inputId="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
        />
        <HFTextField
          label="Verification Code"
          inputId="code"
          name="code"
          type="text"
          placeholder="Enter the code sent to your email"
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <StandardButton type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Verifying...' : 'Verify Email'}
          </StandardButton>
          <ResetButton
            type="button"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Reset
          </ResetButton>
        </Box>
        <Box sx={{ mt: 2 }}>
          <StandardButton
            type="button"
            color="neutral"
            onClick={handleResend}
            disabled={form.formState.isSubmitting}
          >
            Resend Code
          </StandardButton>
        </Box>
      </Form>
    </FormProvider>
  )
}
