// InputOTP removed, use Input directly
import { Card, CardContent } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { PasswordResetForm } from '@/components/public/PasswordResetForm'
import { useSnackbar } from '@/components/ui/snackbar'
// eslint-disable-next-line max-len
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/graphql/mutations/requestPasswordResetMutation'
// eslint-disable-next-line max-len
import { RESET_PASSWORD_MUTATION } from '@/graphql/mutations/resetPasswordMutation'
import { useAuthStore } from '@/store/auth'
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

  // Show stock warning when navigated here with an email query param
  useEffect(() => {
    if (defaultEmail) {
      showSnackbar({
        message:
          'Please check your email for the password reset code ' +
          'to reset your password.',
        color: 'warning',
      })
    }
  }, [defaultEmail, showSnackbar])

  const handleRequestReset = async (values: { email: string }) => {
    try {
      const result = await client
        .mutation(REQUEST_PASSWORD_RESET_MUTATION, { email: values.email })
        .toPromise()

      if (result.error) {
        showSnackbar({
          message: result.error.message || 'Failed to send reset code',
          color: 'error',
        })
        return
      }

      showSnackbar({ message: 'Reset code sent!', color: 'success' })
      setHasRequestedReset(true)
      setRequestEmail(values.email)
    } catch (error: any) {
      showSnackbar({
        message: error.message || 'An error occurred',
        color: 'error',
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
          color: 'error',
        })
        return
      }

      if (result.data?.resetPassword) {
        const { token, user } = result.data.resetPassword
        try {
          localStorage.setItem('token', token)
        } catch {
          // ignore storage errors
        }
        useAuthStore.getState().setAuth(token, user)
        showSnackbar({
          message: 'Password reset successful!',
          color: 'success',
        })
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

  return (
    <Card elevation={8} sx={{ width: '100%', maxWidth: 400 }} role="region">
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
