import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Typography } from '@mui/joy'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

const emailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
})

export const EmailVerificationForm = ({
  onVerify,
  onResendCode,
  loading = false,
  defaultEmail = '',
}: {
  onVerify: (values: { email: string; code: string }) => void
  onResendCode: (email: string) => void
  loading?: boolean
  defaultEmail?: string
}) => {
  const form = useForm<z.infer<typeof emailVerificationSchema>>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: defaultEmail,
      code: '',
    },
  })

  const handleSubmit = form.handleSubmit(onVerify)
  const handleResend = () => {
    const email = form.getValues('email')
    onResendCode(email)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          inputId="email-input"
          children={
            <FormItem>
              <FormControl>
                <Input
                  id="email-input"
                  placeholder="Enter your email"
                  {...form.register('email')}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          }
        />
        <FormField
          label="Verification Code"
          inputId="code-input"
          children={
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  slotProps={{
                    input: {
                      ...form.register('code'),
                      id: 'code-input',
                    },
                  }}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.code?.message}</FormMessage>
            </FormItem>
          }
        />
        <Button type="submit" disabled={loading}>
          {}
          <Typography
            level="title-lg"
            fontWeight="lg"
            sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '4px' }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Typography>
        </Button>
        <Button type="button" variant="outlined" onClick={handleResend}>
          <Typography
            level="title-lg"
            fontWeight="lg"
            sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '4px' }}
          >
            Resend Code
          </Typography>
        </Button>
      </form>
    </Form>
  )
}
