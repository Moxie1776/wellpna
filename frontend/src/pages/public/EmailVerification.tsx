import { Card, CardContent } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// eslint-disable-next-line max-len
import { EmailVerificationForm } from '@/components/public/EmailVerificationForm'
import { useSnackbar } from '@/components/ui/snackbar'
// eslint-disable-next-line max-len
import { SEND_VERIFICATION_EMAIL_MUTATION } from '@/graphql/mutations/sendVerificationEmailMutation'
import { VERIFY_EMAIL_MUTATION } from '@/graphql/mutations/verifyEmailMutation'
import { useAuthStore } from '@/store/auth'
import client from '@/utils/graphqlClient'

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const defaultEmail = searchParams.get('email') || ''

  // Show a stock warning message when navigating here with an email query param
  // so the user knows to check their email for the verification code.
  useEffect(() => {
    if (defaultEmail) {
      showSnackbar({
        message:
          'Please check your email for the 6-digit verification code ' +
          'to verify your account.',
        color: 'warning',
      })
    }
  }, [defaultEmail, showSnackbar])

  const handleVerify = async (values: { email: string; code: string }) => {
    try {
      const result = await client
        .mutation(VERIFY_EMAIL_MUTATION, {
          data: {
            email: values.email,
            code: values.code,
          },
        })
        .toPromise()

      if (result.error) {
        showSnackbar({
          message: result.error.message || 'Verification failed',
          color: 'error',
        })
        return
      }

      if (result.data?.verifyEmail) {
        const { token, user } = result.data.verifyEmail
        // Persist token and update auth store so the app recognizes the user
        try {
          localStorage.setItem('token', token)
        } catch {
          // ignore storage errors
        }
        useAuthStore.getState().setAuth(token, user)
        showSnackbar({ message: 'Email verified!', color: 'success' })
        navigate('/dashboard')
      }
    } catch (error: any) {
      showSnackbar({
        message: error.message || 'An error occurred',
        color: 'error',
      })
    } finally {
      //
    }
  }

  const handleResendCode = async (email: string) => {
    if (!email) {
      showSnackbar({ message: 'Please enter your email', color: 'warning' })
      return
    }

    try {
      const result = await client
        .mutation(SEND_VERIFICATION_EMAIL_MUTATION, { email })
        .toPromise()

      if (result.error) {
        showSnackbar({
          message: result.error.message || 'Failed to send code',
          color: 'error',
        })
        return
      }

      showSnackbar({
        message: 'Verification code sent to your email',
        color: 'primary',
      })
    } catch (error: any) {
      showSnackbar({
        message: error.message || 'An error occurred',
        color: 'error',
      })
    }
  }

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 400,
      }}
      role="region"
    >
      <CardContent>
        <EmailVerificationForm
          defaultEmail={defaultEmail}
          onVerify={handleVerify}
          onResendCode={handleResendCode}
        />
      </CardContent>
    </Card>
  )
}

export default EmailVerificationPage
