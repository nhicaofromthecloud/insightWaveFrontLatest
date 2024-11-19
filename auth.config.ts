import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/'
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.email = user.email;
        token.exp = Math.floor(oneDayFromNow.getTime() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string;
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        session.expires = oneDayFromNow;
      }
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'Login',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          const response = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const data = await response.json();

          if (!response.ok || data.status !== 'success') {
            throw new Error(data.message || 'Login failed');
          }

          return {
            id: data.data.id,
            email: data.data.email,
            accessToken: data.token
          };
        } catch (error: any) {
          throw new Error(error.message || 'Login failed');
        }
      }
    }),

    CredentialsProvider({
      id: 'signup',
      name: 'Signup',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        confirmPassword: { type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          const response = await fetch(`${process.env.API_URL}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              confirmPassword: credentials.confirmPassword
            })
          });

          const data = await response.json();

          if (!response.ok || data.status !== 'success') {
            throw new Error(data.message || 'Signup failed');
          }

          return {
            id: data.data.id,
            email: data.data.email,
            accessToken: data.token
          };
        } catch (error: any) {
          throw new Error(error.message || 'Signup failed');
        }
      }
    })
  ]
};
