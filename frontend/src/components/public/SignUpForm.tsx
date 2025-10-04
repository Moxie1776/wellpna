import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Input } from '@mui/joy'
import Typography from '@mui/joy/Typography'
import { useForm } from 'react-hook-form'
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

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SignUpForm = ({ onSignup }: { onSignup: () => void }) => {
  const { signUp, error } = useAuth()
  console.log('SignupForm error:', error)

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signUp(values.email, values.password, values.name)
      onSignup()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handling is done in the useAuth hook
    }
  }

  return (
    <Form>
      <Box sx={{ my: 2 }}>
        <Typography level="h4" sx={{ mb: 2 }}>
          Sign Up
        </Typography>
        <FormField
          label="Name"
          inputId="signup-name"
          variant="solid"
          children={
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  type="text"
                  variant="solid"
                  slotProps={{
                    input: { ...form.register('name'), id: 'signup-name' },
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          }
        />
        <FormField
          label="Email"
          inputId="signup-email"
          children={
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  variant="solid"
                  slotProps={{
                    input: { ...form.register('email'), id: 'signup-email' },
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          }
        />
        <FormField
          label="Password"
          inputId="signup-password"
          children={
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  variant="solid"
                  placeholder="Enter your password"
                  slotProps={{
                    input: {
                      ...form.register('password'),
                      id: 'signup-password',
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
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          sx={{ mt: 4 }}
        >
          Sign Up
        </Button>
        {error && (
          <Typography level="body-sm" color="danger" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Form>
  )
}
