import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mui/joy'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormControl, FormItem } from '@/components/hookForm/HFForm'
import HFInput from '@/components/hookForm/HFInput'

import logger from '../../utils/logger'

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
    logger.debug('EmailVerificationForm submit', data)
    onVerify({
      email: data.email,
      code: data.code,
    })
  })

  const handleResend = () => {
    const email = form.getValues('email')
    logger.debug('EmailVerificationForm resend', email)
    onResendCode(email)
  }

  // Helper text state for email and code
  const [emailHelperText, setEmailHelperText] = useState(
    'Enter your email address.',
  )
  const [codeHelperText, setCodeHelperText] = useState(
    'Enter the code sent to your email.',
  )

  useEffect(() => {
    if (form.formState.errors.email) {
      setEmailHelperText(
        form.formState.errors.email.message || 'Enter your email address.',
      )
    } else {
      setEmailHelperText('Enter your email address.')
    }
    if (form.formState.errors.code) {
      setCodeHelperText(
        form.formState.errors.code.message ||
          'Enter the code sent to your email.',
      )
    } else {
      setCodeHelperText('Enter the code sent to your email.')
    }
  }, [
    form.formState.errors.email,
    form.formState.errors.code,
    form.formState.isSubmitted,
    form.formState.isLoading,
  ])

  return (
    <FormProvider {...form}>
      <Form onSubmit={onSubmit}>
        <FormItem>
          <FormControl>
            <HFInput
              name="email"
              label="Email"
              type="email"
              helperText={emailHelperText}
            />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormControl>
            <HFInput
              name="code"
              label="Verification Code"
              type="text"
              helperText={codeHelperText}
            />
          </FormControl>
        </FormItem>
        <Button type="submit" disabled={form.formState.isLoading}>
          {form.formState.isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={handleResend}
          disabled={form.formState.isLoading}
        >
          Resend Code
        </Button>
      </Form>
    </FormProvider>
  )
}
