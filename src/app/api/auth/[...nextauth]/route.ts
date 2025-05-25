// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcrypt";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

// Extend the Session type to include id and role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
  interface User {
    id: string;
    role: string;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSrvKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;

// service-role client for authorize()
const supabaseAdmin = createClient(supabaseUrl, supabaseSrvKey);

type NextAuthJWT = JWT & { role?: string };

const authHandler = NextAuth({
  adapter: SupabaseAdapter({ url: supabaseUrl, secret: supabaseSrvKey }),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id,email,name,role,password_hash")
          .eq("email", credentials.email)
          .single();
        if (error || !user) return null;
        const isValid = await compare(credentials.password, user.password_hash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: NextAuthJWT;
      user?: User;
    }): Promise<NextAuthJWT> {
      if (user) token.role = user.role;
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: NextAuthJWT;
    }): Promise<Session> {
      session.user = {
        id: token.sub!,
        email: session.user!.email!,
        name: session.user!.name!,
        role: token.role as string,
      };
      return session;
    },
  },
  pages: { signIn: "/auth/signin", newUser: "/auth/signup" },
  secret: nextAuthSecret,
});

export { authHandler as GET, authHandler as POST };
