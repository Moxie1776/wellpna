import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import { useNavigate } from 'react-router-dom'

import { SignInForm } from '@/components/public/SignInForm'

const SignInPage = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/')
  }

  return (
    <Card
      color="primary"
      variant="soft"
      sx={{
        minWidth: 300,
        maxWidth: 400,
        justifyContent: 'center',
        justifyItems: 'center',
      }}
    >
      <CardContent>
        <SignInForm onSignIn={handleLogin} />
      </CardContent>
    </Card>
  )
}

export default SignInPage
