'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './ThemeToggle/theme-provider';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';

const queryClient = new QueryClient();

export default function Providers({
  session,
  children
}: {
  session: SessionProviderProps['session'];
  children: React.ReactNode;
}) {
  // Remember to use SessionProvider with session={session} when using sidebar
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
