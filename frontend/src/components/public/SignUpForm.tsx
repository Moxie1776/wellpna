import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/joy/Typography';
import { useForm } from 'react-hook-form';
// ...existing code...
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useAuth } from '../../hooks/useAuth';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignUpForm = ({ onSignup }: { onSignup: () => void }) => {
  const { signUp, error } = useAuth();
  console.log('SignupForm error:', error);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signUp(values.email, values.password, values.name);
      onSignup();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handling is done in the useAuth hook
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <Typography level='h4' sx={{ mb: 2 }}>
        Sign Up
      </Typography>
      <CardContent>
        <Form>
          <FormField
            label='Name'
            inputId='signup-name'
            children={
              <FormItem>
                <FormControl>
                  <Input
                    placeholder='Enter your name'
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
            label='Email'
            inputId='signup-email'
            children={
              <FormItem>
                <FormControl>
                  <Input
                    placeholder='Enter your email'
                    slotProps={{
                      input: { ...form.register('email'), id: 'signup-email' },
                    }}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            }
          />
          <FormField
            label='Password'
            inputId='signup-password'
            children={
              <FormItem>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password'
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
          <Button type='submit' onClick={form.handleSubmit(onSubmit)}>
            Sign Up
          </Button>
          {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
        </Form>
      </CardContent>
    </Card>
  );
};
