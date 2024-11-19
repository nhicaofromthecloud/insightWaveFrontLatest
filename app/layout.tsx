import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { auth } from '@/auth';
import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Next Shadcn',
  description: 'Basic dashboard with Next.js and Shadcn'
};

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pathname = headers().get('x-pathname') || '';

  // Show toast for unauthorized access to protected routes
  if (!session?.user && pathname.startsWith('/dashboard')) {
    toast.error('Please log in to access this page');
    redirect('/');
  }

  return (
    <html lang="en" className={`${lato.className}`}>
      <body className={'overflow-hidden'} suppressHydrationWarning={true}>
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
