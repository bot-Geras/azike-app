// admin/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password,
          }),
          headers: { 'Content-Type': 'application/json' }
        });

        const response = await res.json();

        if (!res.ok || !response.success) {
          throw new Error(response.message || 'Invalid credentials');
        }

        const { user, access_token } = response.data;

        // Ensure the user has admin privileges
        const isAdmin = user.roles.some((r: string) => ['admin', 'super_admin'].includes(r));
        if (!isAdmin) throw new Error('Not authorized');

        return { ...user, accessToken: access_token };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as any).roles;
        token.accessToken = (user as any).accessToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).roles = token.roles;
        (session.user as any).userId = token.userId;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
};

export async function requireAuth() {
  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  return session;
}