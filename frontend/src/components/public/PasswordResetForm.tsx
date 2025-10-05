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

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Code must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function PasswordResetForm({
  mode,
  loading = false,
  defaultEmail = '',
  onRequestReset,
  onResetPassword,
}: {
  mode: 'request' | 'reset'
  loading?: boolean
  defaultEmail?: string
  onRequestReset?: (values: { email: string }) => void
  onResetPassword?: (values: {
    code: string
    newPassword: string
    confirmPassword: string
  }) => void
}) {
  const requestForm = useForm<z.infer<typeof requestResetSchema>>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: defaultEmail },
  })
  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  })

  return mode === 'request' ? (
    <Form {...requestForm}>
      <form onSubmit={requestForm.handleSubmit(onRequestReset!)}>
        <FormField
          label="Email"
          inputId="reset-email-input"
          children={
            <FormItem>
              <FormControl>
                <Input
                  id="reset-email-input"
                  placeholder="Enter your email"
                  {...requestForm.register('email')}
                />
              </FormControl>
              <FormMessage>
                {requestForm.formState.errors.email?.message}
              </FormMessage>
            </FormItem>
          }
        />
        <Button type="submit" disabled={loading}>
          <Typography level="title-lg" fontWeight="lg">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Typography>
        </Button>
      </form>
    </Form>
  ) : (
    <Form {...resetForm}>
      <form onSubmit={resetForm.handleSubmit(onResetPassword!)}>
        <FormField
          label="Verification Code"
          inputId="reset-code-input"
          children={
            <FormItem>
              <FormControl>
                <Input
                  id="reset-code-input"
                  placeholder="Enter 6-digit code"
                  {...resetForm.register('code')}
                />
              </FormControl>
              <FormMessage>
                {resetForm.formState.errors.code?.message}
              </FormMessage>
            </FormItem>
          }
        />
        <FormField
          label="New Password"
          inputId="reset-new-password-input"
          children={
            <FormItem>
              <FormControl>
                <Input
                  id="reset-new-password-input"
                  type="password"
                  placeholder="Enter new password"
                  {...resetForm.register('newPassword')}
                />
              </FormControl>
              <FormMessage>
                {resetForm.formState.errors.newPassword?.message}
              </FormMessage>
            </FormItem>
          }
        />
        <FormField
          label="Confirm Password"
          inputId="reset-confirm-password-input"
          children={
            <FormItem>
              <FormControl>
                <Input
                  id="reset-confirm-password-input"
                  type="password"
                  placeholder="Confirm new password"
                  {...resetForm.register('confirmPassword')}
                />
              </FormControl>
              <FormMessage>
                {resetForm.formState.errors.confirmPassword?.message}
              </FormMessage>
            </FormItem>
          }
        />
        <Button type="submit" disabled={loading}>
          <Typography level="title-lg" fontWeight="lg">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Typography>
        </Button>
      </form>
    </Form>
  )
}
