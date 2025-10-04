import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, Input, Typography } from '@mui/joy'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gql, useMutation } from 'urql'
// ...existing code...
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useSnackbar } from '@/components/ui/snackbar'

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
  })

  const [, verifyEmailMutation] = useMutation(VERIFY_EMAIL_MUTATION)
  const [, sendVerificationEmailMutation] = useMutation(
    SEND_VERIFICATION_EMAIL_MUTATION,
  )

  const onSubmit = async (values: z.infer<typeof emailVerificationSchema>) => {
    setLoading(true)
    try {
      const result = await verifyEmailMutation({
        email: values.email,
        code: values.code,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      showSnackbar({
        message: 'Email verified successfully! You are now logged in.',
        color: 'primary',
      })

      // Redirect to dashboard or home
      navigate('/dashboard')
    } catch (err: unknown) {
      showSnackbar({
        message: err instanceof Error ? err.message : 'Failed to verify email',
        color: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    const email = form.getValues('email')
    if (!email) {
      showSnackbar({
        message: 'Please enter your email address',
        color: 'danger',
      })
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
        <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Email" inputId="verify-email">
            <FormItem>
              {/* <FormLabel htmlFor='verify-email'>Email</FormLabel> */}
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  variant="solid"
                  slotProps={{
                    input: {
                      ...form.register('email'),
                      id: 'verify-email',
                    },
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          </FormField>
          <FormField label="Verification Code" inputId="verify-code">
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  variant="solid"
                  sx={{ length: '6' }}
                  placeholder="Enter 6-digit code"
                  slotProps={{
                    input: {
                      ...form.register('code'),
                      id: 'verify-code',
                      disabled: form.formState.isSubmitting,
                      pattern: '\\d{6}',
                      maxLength: 6,
                    },
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.code?.message}</FormMessage>
            </FormItem>
          </FormField>
          <Button type="submit" disabled={loading}>
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
