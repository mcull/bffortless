import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { DefaultSession, EventCallbacks } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

const prisma = new PrismaClient();

const handler = NextAuth({
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
          user: { id: user.id, email: user.email }, 
          account: { provider: account?.provider, type: account?.type },
          profile: { sub: profile?.sub }
        }, null, 2));

        // Ensure we have the required user data
        if (!user.email) {
          console.error('[NextAuth] SignIn failed: No email provided');
          return false;
        }

        return true;
      } catch (error) {
        console.error('[NextAuth] SignIn callback error:', error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    },
    async session({ session, user }) {
      try {
        console.log('[NextAuth] Session callback:', JSON.stringify({ 
          sessionUser: session?.user,
          dbUser: { id: user?.id, email: user?.email }
        }, null, 2));

        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      } catch (error) {
        console.error('[NextAuth] Session callback error:', error instanceof Error ? error.message : 'Unknown error');
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log('[NextAuth] Redirect callback:', JSON.stringify({ url, baseUrl }, null, 2));
        
        // Handle relative URLs
        if (url.startsWith('/')) {
          const fullUrl = `${baseUrl}${url}`;
          console.log('[NextAuth] Redirecting to relative URL:', fullUrl);
          return fullUrl;
        }
        
        // Handle absolute URLs from the same origin
        if (url.startsWith(baseUrl)) {
          console.log('[NextAuth] Redirecting to same-origin URL:', url);
          return url;
        }
        
        // Default to home page
        console.log('[NextAuth] Redirecting to base URL:', baseUrl);
        return baseUrl;
      } catch (error) {
        console.error('[NextAuth] Redirect callback error:', error instanceof Error ? error.message : 'Unknown error');
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
});

export { handler as GET, handler as POST }; 