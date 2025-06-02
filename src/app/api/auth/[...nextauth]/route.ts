import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
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
      console.log('[NextAuth] SignIn callback started:', { 
        user: { id: user.id, email: user.email }, 
        account: { provider: account?.provider, type: account?.type },
        profile: { sub: profile?.sub }
      });
      return true;
    },
    async session({ session, user }) {
      console.log('[NextAuth] Session callback:', { 
        sessionUser: session?.user,
        dbUser: { id: user?.id, email: user?.email }
      });
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect callback:', { url, baseUrl });
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString();
      }
      return baseUrl;
    },
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[NextAuth] Error:', { code, metadata });
    },
    warn(code) {
      console.warn('[NextAuth] Warning:', { code });
    },
    debug(code, metadata) {
      console.log('[NextAuth] Debug:', { code, metadata });
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