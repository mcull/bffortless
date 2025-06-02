import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('[NextAuth] SignIn callback started:', JSON.stringify({ 
          user: { id: user?.id, email: user?.email }, 
          account: { 
            provider: account?.provider, 
            type: account?.type,
            scope: account?.scope,
            token_type: account?.token_type,
            expires_at: account?.expires_at
          },
          profile: { 
            sub: profile?.sub
          }
        }, null, 2));

        if (!user.email) {
          console.error('[NextAuth] SignIn failed: No email provided');
          return false;
        }

        // Check if this OAuth account is already linked to a user
        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
          },
          include: {
            user: true,
          },
        });

        if (existingAccount) {
          console.log('[NextAuth] Found existing account:', JSON.stringify(existingAccount, null, 2));
          return true;
        }

        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            accounts: true,
          },
        });

        console.log('[NextAuth] Existing user check:', JSON.stringify(existingUser, null, 2));

        if (existingUser && account) {
          // If user exists but has no account, link the account
          if (existingUser.accounts.length === 0) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type || 'oauth',
                provider: account.provider || 'google',
                providerAccountId: account.providerAccountId || '',
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
                refresh_token: account.refresh_token,
              },
            });
            console.log('[NextAuth] Linked new account to existing user');
          }
        }

        return true;
      } catch (error) {
        console.error('[NextAuth] SignIn callback error:', error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : 'Unknown error');
        return false;
      }
    },
    async session({ session, user }) {
      try {
        console.log('[NextAuth] Session callback:', JSON.stringify({ 
          sessionUser: { 
            name: session?.user?.name,
            email: session?.user?.email,
            image: session?.user?.image
          },
          dbUser: { 
            id: user?.id, 
            email: user?.email 
          }
        }, null, 2));

        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      } catch (error) {
        console.error('[NextAuth] Session callback error:', error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : 'Unknown error');
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log('[NextAuth] Redirect callback:', JSON.stringify({ 
          url, 
          baseUrl,
          isRelative: url.startsWith('/'),
          isSameOrigin: url.startsWith(baseUrl)
        }, null, 2));
        
        if (url.includes('/api/auth/signin') || url.includes('/api/auth/callback')) {
          console.log('[NextAuth] Redirecting to home after auth:', baseUrl);
          return baseUrl;
        }
        
        if (url.startsWith('/')) {
          const fullUrl = `${baseUrl}${url}`;
          console.log('[NextAuth] Redirecting to relative URL:', fullUrl);
          return fullUrl;
        }
        
        if (url.startsWith(baseUrl)) {
          console.log('[NextAuth] Redirecting to same-origin URL:', url);
          return url;
        }
        
        console.log('[NextAuth] Redirecting to base URL:', baseUrl);
        return baseUrl;
      } catch (error) {
        console.error('[NextAuth] Redirect callback error:', error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : 'Unknown error');
        return baseUrl;
      }
    },
  },
  events: {
    async signIn({ user }) {
      console.log('[NextAuth] SignIn event:', JSON.stringify({ user }, null, 2));
    },
    async signOut({ session, token }) {
      console.log('[NextAuth] SignOut event:', JSON.stringify({ session, token }, null, 2));
    },
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[NextAuth] Error:', JSON.stringify({ code, metadata }, null, 2));
    },
    warn(code) {
      console.warn('[NextAuth] Warning:', JSON.stringify({ code }, null, 2));
    },
    debug(code, metadata) {
      console.log('[NextAuth] Debug:', JSON.stringify({ code, metadata }, null, 2));
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
