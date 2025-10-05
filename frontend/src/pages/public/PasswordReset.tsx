// InputOTP removed, use Input directly
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, Input, Typography } from '@mui/joy'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gql, useMutation } from 'urql'
import { z } from 'zod'
import logger from '@/utils/logger'

// ...existing code...
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useSnackbar } from '@/components/ui/snackbar'

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      token
      user {
        id
        email
        name
      }
    }
  }
`

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Code must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    // eslint-disable-next-line quotes
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const token = searchParams.get('token')
  // Treat any presence of the token param (even empty string) as reset mode
  const isResetMode = searchParams.has('token')

  const requestForm = useForm<z.infer<typeof requestResetSchema>>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  })

  const [, requestResetMutation] = useMutation(REQUEST_PASSWORD_RESET_MUTATION)
  const [, resetPasswordMutation] = useMutation(RESET_PASSWORD_MUTATION)

  const onRequestReset = async (values: z.infer<typeof requestResetSchema>) => {
    setLoading(true)
    try {
      const result = await requestResetMutation({ email: values.email })
      if (result.error) throw new Error(result.error.message)
      showSnackbar({
        message: 'Password reset link sent to your email',
        color: 'primary',
      })
    } catch (err: unknown) {
      showSnackbar({
        message:
          err instanceof Error ? err.message : 'Failed to send reset email',
        color: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const onResetPassword = async (
    values: z.infer<typeof resetPasswordSchema>,
  ) => {
    setLoading(true)
    try {
      const result = await resetPasswordMutation({
        token,
        newPassword: values.newPassword,
        code: values.code,
        inputMode: 'numeric',
      })
      if (result && result.data && result.data.resetPassword === null) {
        // Always treat resetPassword === null as error, prefer error message
        if (result.error && result.error.message) {
          throw new Error(result.error.message)
        } else {
          throw new Error('Malformed token')
        }
      } else if (result && result.error && result.error.message) {
        throw new Error(result.error.message)
      } else if (result && result.error) {
        throw new Error('Unknown error occurred during password reset')
      }
      showSnackbar({
        message: 'Password reset successfully! You are now logged in.',
        color: 'primary',
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      logger.debug('PasswordReset error', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
      })
      showSnackbar({
        message:
          err instanceof Error ? err.message : 'Failed to reset password',
        color: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isResetMode) {
    return (
      <Card
        role="region"
        color="primary"
        variant="soft"
        data-color="primary"
        data-variant="soft"
        sx={{
          minWidth: 300,
          maxWidth: 400,
          justifyContent: 'center',
          justifyItems: 'center',
        }}
      >
        <Typography level="h4" data-level="h4" sx={{ mb: 2 }}>
          Reset Your Password
        </Typography>
        <CardContent>
          <Form>
            <FormField
              label="Verification Code"
              inputId="reset-code"
              children={
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      variant="solid"
                      data-variant="solid"
                      sx={{ length: '6' }}
                      placeholder="Enter 6-digit code"
                      slotProps={{
                        input: {
                          ...resetForm.register('code'),
                          id: 'reset-code',
                          inputMode: 'numeric',
                        },
                      }}
                      disabled={resetForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage>
                    {resetForm.formState.errors.code?.message}
                  </FormMessage>
                </FormItem>
              }
              data-testid="form-field"
            />
            <FormField
              label="New Password"
              inputId="reset-new-password"
              children={
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      variant="solid"
                      data-variant="solid"
                      placeholder="Enter new password"
                      slotProps={{
                        input: {
                          ...resetForm.register('newPassword'),
                          id: 'reset-new-password',
                        },
                      }}
                    />
                  </FormControl>
                  <FormMessage>
                    {resetForm.formState.errors.newPassword?.message}
                  </FormMessage>
                </FormItem>
              }
              data-testid="form-field"
            />
            <FormField
              label="Confirm Password"
              inputId="reset-confirm-password"
              children={
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      variant="solid"
                      data-variant="solid"
                      placeholder="Confirm new password"
                      slotProps={{
                        input: {
                          ...resetForm.register('confirmPassword'),
                          id: 'reset-confirm-password',
                        },
                      }}
                    />
                  </FormControl>
                  <FormMessage>
                    {resetForm.formState.errors.confirmPassword?.message}
                  </FormMessage>
                </FormItem>
              }
              data-testid="form-field"
            />
            <Button
              type="submit"
              disabled={loading}
              onClick={resetForm.handleSubmit(onResetPassword)}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      role="region"
      color="primary"
      variant="soft"
      data-color="primary"
      data-variant="soft"
      sx={{
        minWidth: 300,
        maxWidth: 400,
        justifyContent: 'center',
        justifyItems: 'center',
      }}
    >
      <Typography level="h4" data-level="h4" sx={{ mb: 2 }}>
        Request Password Reset
      </Typography>
      <CardContent>
        <Form>
          <FormField
            label="Email"
            inputId="reset-email"
            children={
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    variant="solid"
                    data-variant="solid"
                    placeholder="Enter your email"
                    slotProps={{
                      input: {
                        ...requestForm.register('email', { required: true }),
                        id: 'reset-email',
                      },
                    }}
                  />
                </FormControl>
                <FormMessage>
                  {requestForm.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            }
            data-testid="form-field"
          />
          <Button
            type="submit"
            disabled={loading}
            onClick={requestForm.handleSubmit(onRequestReset)}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  )
}
export default PasswordResetPage
