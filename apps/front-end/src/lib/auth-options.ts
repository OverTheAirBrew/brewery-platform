import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { usersClient } from './api';

export const authOptions: AuthOptions = {
  callbacks: {
    // async signIn({ user, account }) {
    //   console.log(user);

    //   account!.access_token = user.token;
    //   return true;
    // },
    async jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          accessToken: user.token,
          emailHash: user.emailHash,
        };
      }

      return token;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken as string;
      session.user = { ...session.user, emailHash: token.emailHash };

      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { data } = await usersClient.login({
          email: credentials!.username,
          password: credentials!.password,
        });

        return data;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
