import { zodResolver } from '@hookform/resolvers/zod'
import { Box } from '@mui/joy'
import { Button, Card, CardContent, Input, Typography } from '@mui/joy'
import { useForm } from 'react-hook-form'
import { MdLogin } from 'react-icons/md'
// ...existing code...
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

import { useAuth } from '../../hooks/useAuth'
import logger from '../../utils/logger'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const SignInForm = ({
  onSignIn,
  title = 'Sign In',
}: {
  onSignIn: () => void
  title?: string
}) => {
  const { signIn, error } = useAuth()
  logger.debug('SignInForm error:', error)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    try {
      await signIn(values.email, values.password)
      onSignIn()
    } catch {
      // Error handling is done in the useAuth hook
    }
  }

  const formContent = (
    <Box sx={{ minWidth: 300, maxWidth: 400 }}>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          label="Email"
          inputId="signin-email"
          children={
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  variant="solid"
                  slotProps={{
                    input: {
                      ...form.register('email', { required: true }),
                      id: 'signin-email',
                    },
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          }
        />
        <FormField
          label="Password"
          inputId="signin-password"
          children={
            <FormItem sx={{ py: 10 }}>
              <FormControl>
                <Input
                  type="password"
                  variant="solid"
                  placeholder="Enter your password"
                  slotProps={{
                    input: {
                      ...form.register('password', { required: true }),
                      id: 'signin-password',
                    },
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.password?.message}
              </FormMessage>
            </FormItem>
          }
        />
        <Button type="submit" sx={{ mt: '10px' }}>
          <Typography
            level="body-lg"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: '4px',
            }}
          >
            Sign In&nbsp;
            <MdLogin size={20} />
          </Typography>
        </Button>
        {error && (
          <Typography level="body-sm" color="danger" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Form>
    </Box>
  )

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400 }} color="primary" variant="soft">
      <Typography level="h4" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <CardContent>{formContent}</CardContent>
    </Card>
  )
}
