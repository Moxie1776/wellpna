import { zodResolver } from '@hookform/resolvers/zod'
import { Button,Card, CardContent, Input } from '@mui/joy'
import Typography from '@mui/joy/Typography'
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
    <Card className="w-full max-w-md">
      <Typography level="h4" sx={{ mb: 2 }}>
        Verify Your Email
      </Typography>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-8">
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
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
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
                  <FormMessage>
                    {form.formState.errors.code?.message}
                  </FormMessage>
                </FormItem>
              }
            />
            <Button type="submit" disabled={loading}>
              {/* eslint-disable-next-line max-len */}
              <span className="font-semibold text-lg tracking-wide flex items-center gap-2 p-[4px]">
                {loading ? 'Verifying...' : 'Verify Email'}
              </span>
            </Button>
            <Button type="button" variant="outlined" onClick={handleResend}>
              {/* eslint-disable-next-line max-len */}
              <span className="font-semibold text-lg tracking-wide flex items-center gap-2 p-[4px]">
                Resend Code
              </span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
