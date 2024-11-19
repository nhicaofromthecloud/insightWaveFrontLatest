import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    expires: Date;
    user: {
      id: string;
      email: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    accessToken: string;
  }

  interface JWT {
    accessToken: string;
    userId: string;
    email: string;
    exp: number;
  }
}
