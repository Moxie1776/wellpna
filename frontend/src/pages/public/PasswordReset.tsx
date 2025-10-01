// InputOTP removed, use Input directly
import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/joy/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { gql,useMutation } from 'urql';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// ...existing code...
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSnackbar } from '@/hooks/useSnackbar';

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
    message: 'Passwords don\'t match',
    path: ['confirmPassword'],
  });

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
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
      showSnackbar({
        message: 'Password reset link sent to your email',
        color: 'success',
      });
    } catch (err: unknown) {
      showSnackbar({
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
      showSnackbar({
        message: 'Password reset successfully! You are now logged in.',
        color: 'success',
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      showSnackbar({
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
          <Typography level='h4' sx={{ mb: 2 }}>
            Reset Your Password
          </Typography>
          <CardContent>
            <Form>
              <FormField
                label='Verification Code'
                inputId='reset-code'
                children={
                  <FormItem>
                    <FormControl>
                      <Input
                        type='text'
                        inputMode='numeric'
                        placeholder='Enter 6-digit code'
                        slotProps={{
                          input: {
                            ...resetForm.register('code'),
                            id: 'reset-code',
                          },
                        }}
                        disabled={resetForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>
                      {resetForm.formState.errors.code?.message}
                    </FormMessage>
                  </FormItem>
                }
              />
              <FormField
                label='New Password'
                inputId='reset-new-password'
                children={
                  <FormItem>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Enter new password'
                        slotProps={{
                          input: {
                            ...resetForm.register('newPassword'),
                            id: 'reset-new-password',
                          },
                        }}
                      />
                    </FormControl>
                    <FormMessage>
                      {resetForm.formState.errors.newPassword?.message}
                    </FormMessage>
                  </FormItem>
                }
              />
              <FormField
                label='Confirm Password'
                inputId='reset-confirm-password'
                children={
                  <FormItem>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Confirm new password'
                        slotProps={{
                          input: {
                            ...resetForm.register('confirmPassword'),
                            id: 'reset-confirm-password',
                          },
                        }}
                      />
                    </FormControl>
                    <FormMessage>
                      {resetForm.formState.errors.confirmPassword?.message}
                    </FormMessage>
                  </FormItem>
                }
              />
              <Button
                type='submit'
                disabled={loading}
                onClick={resetForm.handleSubmit(onResetPassword)}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <Typography level='h4' sx={{ mb: 2 }}>
          Request Password Reset
        </Typography>
        <CardContent>
          <Form>
            <FormField
              label='Email'
              inputId='reset-email'
              children={
                <FormItem>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Enter your email'
                      slotProps={{
                        input: {
                          ...requestForm.register('email', { required: true }),
                          id: 'reset-email',
                        },
                      }}
                    />
                  </FormControl>
                  <FormMessage>
                    {requestForm.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              }
            />
            <Button
              type='submit'
              disabled={loading}
              onClick={requestForm.handleSubmit(onRequestReset)}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
export default PasswordResetPage;
