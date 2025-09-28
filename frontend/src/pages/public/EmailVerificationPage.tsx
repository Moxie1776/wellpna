import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useMutation, gql } from 'urql';
import { useToast } from '@/hooks/useToast';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($email: String!, $code: String!) {
    verifyEmail(email: $email, code: $code) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

const SEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation SendVerificationEmail($email: String!) {
    sendVerificationEmail(email: $email)
  }
`;

const emailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof emailVerificationSchema>>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      code: '',
    },
  });

  const [, verifyEmailMutation] = useMutation(VERIFY_EMAIL_MUTATION);
  const [, sendVerificationEmailMutation] = useMutation(
    SEND_VERIFICATION_EMAIL_MUTATION
  );

  const onSubmit = async (values: z.infer<typeof emailVerificationSchema>) => {
    setLoading(true);
    try {
      const result = await verifyEmailMutation({
        email: values.email,
        code: values.code,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      showToast({
        message: 'Email verified successfully! You are now logged in.',
        color: 'success',
      });

      // Redirect to dashboard or home
      navigate('/dashboard');
    } catch (err: unknown) {
      showToast({
        message: err instanceof Error ? err.message : 'Failed to verify email',
        color: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const email = form.getValues('email');
    if (!email) {
      showToast({
        message: 'Please enter your email address',
        color: 'error',
      });
      return;
    }

    try {
      const result = await sendVerificationEmailMutation({ email });

      if (result.error) {
        throw new Error(result.error.message);
      }

      showToast({
        message: 'Verification code sent to your email',
        color: 'success',
      });
    } catch (err: unknown) {
      showToast({
        message:
          err instanceof Error
            ? err.message
            : 'Failed to send verification email',
        color: 'error',
      });
    }
  };

  return (
    <div className='flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
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
              <Button type='submit' disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={handleResendCode}
              >
                Resend Code
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationPage;
