'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import GithubSignInButton from './github-auth-button';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().optional()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const [isSignIn, setIsSignIn] = useState(false);
  const defaultValues = {
    email: 'demo@gmail.com',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(() => {
      signIn(isSignIn ? 'login' : 'signup', {
        email: data.email,
        password: data.password,
        confirmPassword: data.password,
        callbackUrl: callbackUrl ?? '/dashboard'
      });
      toast.success('Signed In Successfully!');
    });
  };

  const isEmailValid = form.formState.isValid && form.getValues('email');

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(
                    'transition-colors duration-200',
                    !form.formState.isValid &&
                      field.value && ['text-red-500', 'animate-shake']
                  )}
                >
                  {!form.formState.isValid && field.value
                    ? 'Email is invalid!'
                    : 'Email'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    disabled={loading}
                    className={cn(
                      'transition-all duration-200',
                      !form.formState.isValid &&
                        field.value && [
                          'animate-shake',
                          'border-red-500',
                          'focus-visible:ring-red-500'
                        ]
                    )}
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      if (!form.formState.isValid && field.value) {
                        // Trigger shake animation on blur if invalid and has value
                        const input = e.target;
                        input.classList.remove('animate-shake');
                        // Force a reflow to restart animation
                        void input.offsetWidth;
                        input.classList.add('animate-shake');
                      }
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={isEmailValid ? '' : 'opacity-50'}>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      isEmailValid
                        ? 'Enter your password...'
                        : 'Enter valid email'
                    }
                    disabled={!isEmailValid}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {isSignIn ? 'Sign in' : 'Sign up'}
          </Button>

          <div className="text-center text-sm">
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-blue-500 hover:underline"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </Form>
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GithubSignInButton /> */}
    </>
  );
}
