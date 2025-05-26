// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcrypt";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: string } & DefaultSession["user"];
  }
  interface JWT {
    userId?: string;
    role?: string;
  }
}

interface User {
  id: string;
  email: string;
  role: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;

        // fetch user
        const { data: user, error } = await supabase
          .from("users")
          .select("id,email,name,password_hash,role")
          .eq("email", creds.email)
          .single();
        if (error || !user) return null;

        // verify hash
        if (!(await compare(creds.password, user.password_hash))) return null;

        // return the user object, including role
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
  async jwt({ token, user }) {
    if (user) {
      token.sub    = (user as User).id;   // ← ensure sub is the UUID
      token.userId = (user as User).id;   // ← your custom claim
      token.role   = (user as User).role; // ← your custom claim
    }
    return token;
  },
  async session({ session, token }) {
    session.user = {
      id:    token.sub!,                  // ← now sub is correct
      email: session.user!.email!,
      name:  session.user!.name!,
      role:  token.role as string,
    };
    return session;
  },
},

  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
