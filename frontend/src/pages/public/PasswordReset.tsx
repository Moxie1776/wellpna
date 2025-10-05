// InputOTP removed, use Input directly
import { Card, CardContent } from '@mui/joy'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { PasswordResetForm } from '@/components/public/PasswordResetForm'
import { useSnackbar } from '@/components/ui/snackbar'

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const isResetMode = searchParams.has('token')
  const defaultEmail = searchParams.get('email') || ''

  const handleRequestReset = (_values: { email: string }) => {
    showSnackbar({ message: 'Reset link sent!', color: 'success' })
  }

  const handleResetPassword = (_values: {
    code: string
    newPassword: string
    confirmPassword: string
  }) => {
    showSnackbar({ message: 'Password reset successful!', color: 'success' })
    navigate('/signin')
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
          mode={isResetMode ? 'reset' : 'request'}
          defaultEmail={defaultEmail}
          onRequestReset={handleRequestReset}
          onResetPassword={handleResetPassword}
        />
      </CardContent>
    </Card>
  )
}

export default PasswordResetPage
