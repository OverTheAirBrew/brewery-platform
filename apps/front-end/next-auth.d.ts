import { JWT as BaseJwt, DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      token: string;
      emailHash: string;
    } & DefaultSession['User'];
  }

  interface User extends DefaultUser {
    token: string;
    emailHash: string;
  }

  interface JWT extends BaseJwt {
    accessToken: string;
    emailHash: string;
  }
}
