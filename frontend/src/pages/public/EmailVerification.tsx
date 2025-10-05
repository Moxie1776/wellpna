import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, FormHelperText, Typography } from '@mui/joy'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gql, useMutation } from 'urql'
import { z } from 'zod'

import { Form, FormField, FormItem } from '@/components/ui/form'
import { useSnackbar } from '@/components/ui/snackbar'
import logger from '@/utils/logger'

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($email: String!, $code: String!) {
    verifyEmail(email: $email, code: $code) {
      token
      user {
        id
        email
        name
      }
    }
  }
`

const SEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation SendVerificationEmail($email: String!) {
    sendVerificationEmail(email: $email)
  }
`

const emailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
})

const EmailVerificationPage = () => {
  // Force re-render on form state changes (errors, values)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof emailVerificationSchema>>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      code: '',
    },
    mode: 'onSubmit',
  })
  // Use form.formState.errors directly for reactive error updates

  const [, verifyEmailMutation] = useMutation(VERIFY_EMAIL_MUTATION)
  const [, sendVerificationEmailMutation] = useMutation(
    SEND_VERIFICATION_EMAIL_MUTATION,
  )

  const onSubmit = async (values: z.infer<typeof emailVerificationSchema>) => {
    setTimeout(() => {
      console.log('formState.errors after submit:', form.formState.errors)
    }, 0)
    setLoading(true)
    try {
      const result = await verifyEmailMutation({
        email: values.email,
        code: values.code,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
      // Show success and navigate
      // ...snackbar logic...
      navigate('/dashboard')
    } catch (err: unknown) {
      logger.debug('Email verification error:', err)
      // ...snackbar logic...
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    const email = form.getValues('email')
    if (!email) {
      // ...snackbar logic...
      return
    }
    try {
      const result = await sendVerificationEmailMutation({ email })

      if (result.error) {
        throw new Error(result.error.message)
      }

      showSnackbar({
        message: 'Verification code sent to your email',
        color: 'primary',
      })
    } catch (err: unknown) {
      showSnackbar({
        message:
          err instanceof Error
            ? err.message
            : 'Failed to send verification email',
        color: 'danger',
      })
    }
  }

  return (
    <Card
      color="primary"
      variant="soft"
      sx={{
        minWidth: 300,
        maxWidth: 400,
        justifyContent: 'center',
        justifyItems: 'center',
      }}
    >
      <Typography level="h4" sx={{ mb: 2 }}>
        Verify Your Email
      </Typography>
      <CardContent>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Email" inputId="verify-email">
            <FormItem>
              <input
                {...form.register('email')}
                id="verify-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <FormHelperText
                data-testid="form-helper-text"
                id="verify-email-helper-text"
              >
                {form.formState.errors.email?.message}
              </FormHelperText>
            </FormItem>
          </FormField>
          <FormField label="Verification Code" inputId="verify-code">
            <FormItem>
              <input
                {...form.register('code')}
                id="verify-code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="Enter 6-digit code"
                disabled={form.formState.isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <FormHelperText
                data-testid="form-helper-text"
                id="verify-code-helper-text"
              >
                {form.formState.errors.code?.message}
              </FormHelperText>
            </FormItem>
          </FormField>
          <Button
            type="button"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
          <Button type="button" variant="outlined" onClick={handleResendCode}>
            Resend Code
          </Button>
        </Form>
      </CardContent>
    </Card>
  )
}

export default EmailVerificationPage
