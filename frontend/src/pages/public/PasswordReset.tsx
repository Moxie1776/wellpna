import { z } from 'zod';
import { useMutation, gql } from 'urql';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

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
  });

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const isResetMode = !!token;

  const requestForm = useForm<z.infer<typeof requestResetSchema>>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '', confirmPassword: '' },
  });

  const [, requestResetMutation] = useMutation(REQUEST_PASSWORD_RESET_MUTATION);
  const [, resetPasswordMutation] = useMutation(RESET_PASSWORD_MUTATION);

  const onRequestReset = async (values: z.infer<typeof requestResetSchema>) => {
    setLoading(true);
    try {
      const result = await requestResetMutation({ email: values.email });
      if (result.error) throw new Error(result.error.message);
      showToast({
        message: 'Password reset link sent to your email',
        color: 'success',
      });
    } catch (err: unknown) {
      showToast({
        message:
          err instanceof Error ? err.message : 'Failed to send reset email',
        color: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (
    values: z.infer<typeof resetPasswordSchema>
  ) => {
    setLoading(true);
    try {
      const result = await resetPasswordMutation({
        token,
        newPassword: values.newPassword,
        code: values.code,
      });
      if (result.error) throw new Error(result.error.message);
      showToast({
        message: 'Password reset successfully! You are now logged in.',
        color: 'success',
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      showToast({
        message:
          err instanceof Error ? err.message : 'Failed to reset password',
        color: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...resetForm}>
              <form
                onSubmit={resetForm.handleSubmit(onResetPassword)}
                className='space-y-8'
              >
                <FormField
                  control={resetForm.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={field.disabled}
                        >
                          <InputOTPGroup>
                            {[...Array(6)].map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter new password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Confirm new password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Request Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...requestForm}>
            <form
              onSubmit={requestForm.handleSubmit(onRequestReset)}
              className='space-y-8'
            >
              <FormField
                control={requestForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter your email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
export default PasswordResetPage;
