import { Card, CardContent } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { SignUpForm } from '@/components/public/SignUpForm'

const SignupPage = () => {
  const navigate = useNavigate()

  const handleSignup = () => {
    navigate('/login')
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
        <SignUpForm onSignup={handleSignup} />
      </CardContent>
    </Card>
  )
}

export default SignupPage
