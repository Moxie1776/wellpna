// InputOTP removed, use Input directly
import { Card, CardContent } from '@mui/joy'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { PasswordResetForm } from '@/components/public/PasswordResetForm'
import { useSnackbar } from '@/components/ui/snackbar'
// eslint-disable-next-line max-len
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/graphql/mutations/requestPasswordResetMutation'
// eslint-disable-next-line max-len
import { RESET_PASSWORD_MUTATION } from '@/graphql/mutations/resetPasswordMutation'
import client from '@/utils/graphqlClient'

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const isResetMode = searchParams.has('code')
  const defaultEmail = searchParams.get('email') || ''
  const defaultCode = searchParams.get('code') || ''
  const [hasRequestedReset, setHasRequestedReset] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_requestEmail, setRequestEmail] = useState('')

  const handleRequestReset = async (values: { email: string }) => {
    try {
      const result = await client
        .mutation(REQUEST_PASSWORD_RESET_MUTATION, { email: values.email })
        .toPromise()

      if (result.error) {
        showSnackbar({
          message: result.error.message || 'Failed to send reset code',
          color: 'danger',
        })
        return
      }

      showSnackbar({ message: 'Reset code sent!', color: 'success' })
      setHasRequestedReset(true)
      setRequestEmail(values.email)
    } catch (error: any) {
      showSnackbar({
        message: error.message || 'An error occurred',
        color: 'danger',
      })
    } finally {
      //
    }
  }

  const handleResetPassword = async (values: {
    code: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      showSnackbar({ message: 'Passwords do not match', color: 'warning' })
      return
    }

    try {
      const result = await client
        .mutation(RESET_PASSWORD_MUTATION, {
          data: {
            code: values.code,
            newPassword: values.newPassword,
          },
        })
        .toPromise()

      if (result.error) {
        showSnackbar({
          message: result.error.message || 'Reset failed',
          color: 'danger',
        })
        return
      }

      if (result.data?.resetPassword) {
        const { token } = result.data.resetPassword
        localStorage.setItem('token', token)
        showSnackbar({
          message: 'Password reset successful!',
          color: 'success',
        })
        navigate('/dashboard')
      }
    } catch (error: any) {
      showSnackbar({
        message: error.message || 'An error occurred',
        color: 'danger',
      })
    } finally {
      //
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
        <PasswordResetForm
          mode={isResetMode || hasRequestedReset ? 'reset' : 'request'}
          defaultEmail={defaultEmail}
          defaultCode={defaultCode}
          onRequestReset={handleRequestReset}
          onResetPassword={handleResetPassword}
        />
      </CardContent>
    </Card>
  )
}

export default PasswordResetPage
