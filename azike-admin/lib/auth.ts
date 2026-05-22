// admin/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

declare module 'next-auth' {
  interface User {
    roles?: string[];
    accessToken?: string;
    userId?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
      accessToken?: string;
      userId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[];
    accessToken?: string;
    userId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'admin@azike.com',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: '••••••••',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          if (!loginRes.ok) {
            const error = await loginRes.json();
            throw new Error(error.message || 'Invalid credentials');
          }

          const loginData = await loginRes.json();
          const { access_token } = loginData.data;

          const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          if (!meRes.ok) {
            throw new Error('Failed to fetch user data');
          }

          const meData = await meRes.json();
          const user = meData.data;

          const isAdmin = user.roles?.some(
            (r: string) => r === 'admin' || r === 'super_admin'
          );

          if (!isAdmin) {
            throw new Error('You do not have admin access');
          }

          return {
            id: user.user_id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            roles: user.roles,
            accessToken: access_token,
            userId: user.user_id,
          };
        } catch (error: any) {
          console.error('Auth error:', error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.roles = user.roles;
        token.userId = user.userId;
        token.accessToken = user.accessToken;
      }

      if (trigger === 'update') {
        // Handle session updates
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.roles = token.roles;
        session.user.userId = token.userId;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};