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
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const defaultValues = {
    email: 'demo@gmail.com',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn(isSignIn ? 'login' : 'signup', {
          email: data.email,
          password: data.password,
          confirmPassword: data.password,
          callbackUrl: callbackUrl ?? '/dashboard',
          redirect: false
        });

        if (result?.error && isSignIn) {
          toast.error('Email or password is incorrect');
        } else if (result?.error && !isSignIn) {
          toast.error('Email already registered');
        } else if (result?.ok) {
          toast.success(
            isSignIn ? 'Signed in successfully!' : 'Account created successfully!'
          );
          router.push(callbackUrl ?? '/dashboard');
        }
      } catch (error) {
        toast.error('Authentication failed. Please try again.');
      }
    });
  };

  const isEmailValid = form.formState.isValid && form.getValues('email');

  const handleDisabledClick = () => {
    const emptyFields: string[] = [];
    if (!form.getValues('email')) emptyFields.push('email');
    if (form.getValues('email') && !form.getValues('password')) {
      emptyFields.push('password');
    }

    setInvalidFields(emptyFields);
    // Reset the animation after a short delay
    setTimeout(() => setInvalidFields([]), 1000);
  };

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
                    (!form.formState.isValid ||
                      invalidFields.includes('email')) &&
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
                      (!form.formState.isValid ||
                        invalidFields.includes('email')) && [
                        'animate-shake',
                        'border-red-500',
                        'focus-visible:ring-red-500'
                      ]
                    )}
                    {...field}
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
                <FormLabel
                  className={cn(
                    'transition-colors duration-200',
                    invalidFields.includes('password') && [
                      'text-red-500',
                      'animate-shake'
                    ]
                  )}
                >
                  {invalidFields.includes('password')
                    ? 'Enter password!'
                    : 'Password'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      isEmailValid
                        ? 'Enter your password...'
                        : 'Enter valid email'
                    }
                    disabled={!isEmailValid}
                    className={cn(
                      'transition-all duration-200',
                      invalidFields.includes('password') && [
                        'animate-shake',
                        'border-red-500',
                        'focus-visible:ring-red-500'
                      ]
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={loading}
            className="ml-auto w-full"
            type="submit"
            onClick={(e) => {
              if (!form.getValues('email') || !form.getValues('password')) {
                e.preventDefault();
                handleDisabledClick();
              }
            }}
          >
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
