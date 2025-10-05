import { Card, CardContent } from '@mui/joy'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { EmailVerificationForm } from '@/components/public/EmailVerificationForm'
import { useSnackbar } from '@/components/ui/snackbar'

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const defaultEmail = searchParams.get('email') || ''

  const handleVerify = (_values: { email: string; code: string }) => {
    showSnackbar({ message: 'Email verified!', color: 'success' })
    navigate('/dashboard')
  }

  const handleResendCode = (email: string) => {
    if (!email) {
      showSnackbar({ message: 'Please enter your email', color: 'warning' })
    } else {
      showSnackbar({
        message: 'Verification code sent to your email',
        color: 'primary',
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
        />
      </CardContent>
    </Card>
  )
}

export default EmailVerificationPage
