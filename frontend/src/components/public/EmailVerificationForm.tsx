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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const emailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

export const EmailVerificationForm = ({
  onVerify,
  onResendCode,
  loading = false,
  defaultEmail = '',
}: {
  onVerify: (values: { email: string; code: string }) => void;
  onResendCode: (email: string) => void;
  loading?: boolean;
  defaultEmail?: string;
}) => {
  const form = useForm<z.infer<typeof emailVerificationSchema>>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: defaultEmail,
      code: '',
    },
  });

  const handleSubmit = form.handleSubmit(onVerify);
  const handleResend = () => {
    const email = form.getValues('email');
    onResendCode(email);
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className='space-y-8'>
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
              <span className='font-semibold text-lg tracking-wide flex items-center gap-2 p-[4px]'>
                {loading ? 'Verifying...' : 'Verify Email'}
              </span>
            </Button>
            <Button type='button' variant='outline' onClick={handleResend}>
              <span className='font-semibold text-lg tracking-wide flex items-center gap-2 p-[4px]'>
                Resend Code
              </span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
