import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/joy/Typography';
import { useForm } from 'react-hook-form';
import { MdLogin } from 'react-icons/md';
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

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SignInForm = ({
  onSignIn,
  showCard = true,
  title = 'Sign In',
}: {
  onSignIn: () => void;
  showCard?: boolean;
  title?: string;
}) => {
  const { signIn, error } = useAuth();
  console.log('SignInForm error:', error);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    try {
      await signIn(values.email, values.password);
      onSignIn();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handling is done in the useAuth hook
    }
  };

  const formContent = (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <div className='my-10'>
        <FormField
          label='Email'
          inputId='signin-email'
          children={
            <FormItem>
              <FormControl>
                <Input
                  placeholder='Enter your email'
                  type='email'
                  slotProps={{
                    input: {
                      ...form.register('email', { required: true }),
                      id: 'signin-email',
                    },
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          }
        />
        <FormField
          label='Password'
          inputId='signin-password'
          children={
            <FormItem className='py-10'>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  slotProps={{
                    input: {
                      ...form.register('password', { required: true }),
                      id: 'signin-password',
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
        <Button type='submit' className='mt-[10px]'>
          <span className='font-semibold text-lg tracking-wide flex items-center gap-2 p-[4px]'>
            Sign In&nbsp;
            <MdLogin size={20} />
          </span>
        </Button>
        {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
      </div>
    </Form>
  );

  return showCard ? (
    <Card className='w-full max-w-md'>
      <Typography level='h4' sx={{ mb: 2 }}>
        {title}
      </Typography>
      <CardContent>{formContent}</CardContent>
    </Card>
  ) : (
    formContent
  );
};
