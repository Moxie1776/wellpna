import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  // FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginForm = ({
  onLogin,
  showCard = true,
  title = 'Login',
}: {
  onLogin: () => void;
  showCard?: boolean;
  title?: string;
}) => {
  const { signIn, error } = useAuth();
  console.log('LoginForm error:', error);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await signIn(values.email, values.password);
      onLogin();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handling is done in the useAuth hook
    }
  };

  const formContent = (
    <Form {...form}>
      <div className='my-10'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Email</FormLabel> */}
                <FormControl>
                  <Input placeholder='Enter your email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='py-10'>
                {/* <FormLabel>Password</FormLabel> */}
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='mt-[10px]'>
            Login&nbsp;
            <LogIn size={20} />
          </Button>
          {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
        </form>
      </div>
    </Form>
  );

  if (showCard) {
    return (
      <Card className='w-full border-0'>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    );
  }

  return formContent;
};
