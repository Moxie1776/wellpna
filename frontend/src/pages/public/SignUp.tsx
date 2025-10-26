import { Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { SignUpForm } from '@/components/public/SignUpForm'

const SignupPage = () => {
  const navigate = useNavigate()

  const handleSignup = () => {
    navigate('/verify-email')
  }

  return (
    <Card
      elevation={8}
      sx={{
        // minWidth: 300,
        width: '100%',
        maxWidth: 400,
        justifyContent: 'center',
        justifyItems: 'center',
      }}
    >
      <CardContent>
        <SignUpForm onSignup={handleSignup} />
      </CardContent>
    </Card>
  )
}

export default SignupPage
