import { Card, CardContent } from '@mui/joy'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// eslint-disable-next-line max-len
import { EmailVerificationForm } from '@/components/public/EmailVerificationForm'
import { useSnackbar } from '@/components/ui/snackbar'
// eslint-disable-next-line max-len
import { SEND_VERIFICATION_EMAIL_MUTATION } from '@/graphql/mutations/sendVerificationEmailMutation'
import { VERIFY_EMAIL_MUTATION } from '@/graphql/mutations/verifyEmailMutation'
import client from '@/utils/graphqlClient'

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const defaultEmail = searchParams.get('email') || ''
  const [loading, setLoading] = useState(false)

  const handleVerify = async (values: { email: string; code: string }) => {
    setLoading(true)
    try {
      const result = await client
        .mutation(VERIFY_EMAIL_MUTATION, {
          email: values.email,
          code: values.code,
        })
        .toPromise()

      if (result.error) {
        showSnackbar({
          message: result.error.message || 'Verification failed',
          color: 'danger',
        })
        return
      }

      if (result.data?.verifyEmail) {
        const { token } = result.data.verifyEmail
        localStorage.setItem('token', token)
        showSnackbar({ message: 'Email verified!', color: 'success' })
        navigate('/dashboard')
      }
    } catch (error: any) {
      showSnackbar({
        message: error.message || 'An error occurred',
        color: 'danger',
      })
    } finally {
      setLoading(false)
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
          color: 'danger',
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
        color: 'danger',
      })
    }
  }

  return (
    <Card
      color="primary"
      variant="soft"
      sx={{ minWidth: 300, maxWidth: 400 }}
      role="region"
    >
      <CardContent>
        <EmailVerificationForm
          defaultEmail={defaultEmail}
          onVerify={handleVerify}
          onResendCode={handleResendCode}
          loading={loading}
        />
      </CardContent>
    </Card>
  )
}

export default EmailVerificationPage
