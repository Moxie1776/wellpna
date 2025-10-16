import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import { useNavigate } from 'react-router-dom'

import { SignInForm } from '@/components/public/SignInForm'

const SignInPage = () => {
  const navigate = useNavigate()

  return (
    <Card
      color="primary"
      variant="soft"
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
