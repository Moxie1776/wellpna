import { Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { SignInForm } from '@/components/public/SignInForm'

const SignInPage = () => {
  const navigate = useNavigate()

  return (
    <Card
      color="primary"
      sx={{
        minWidth: 300,
        maxWidth: 400,
      }}
    >
      <CardContent>
        <SignInForm
          title="Sign in to your account"
          onSignIn={() => navigate('/dashboard')}
        />
      </CardContent>
    </Card>
  )
}

export default SignInPage
