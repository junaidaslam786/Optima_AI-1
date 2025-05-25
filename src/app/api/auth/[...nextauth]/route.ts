import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcrypt";

// --- ENV VARS ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseSrv = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const nextAuthSecret = process.env.NEXTAUTH_SECRET!;

// --- Supabase clients ---
// adapter uses service-role behind the scenes (thanks to `secret`)
const supabaseAdapterClient = createClient(supabaseUrl, supabaseSrv);
// credentials authorize() uses service-role so it can bypass RLS
const supabaseServiceClient = createClient(supabaseUrl, supabaseSrv);

export const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseSrv, // ← point at your custom schema
  }),
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

        // 1) fetch user row from next_auth.users
        const { data: user, error } = await supabaseServiceClient
          .from("users")
          .select("id, email, name, role, password_hash")
          .eq("email", credentials.email)
          .single();

        if (error || !user) return null;

        // 2) verify hash
        const isValid = await compare(credentials.password, user.password_hash);
        if (!isValid) return null;

        // 3) return the shape NextAuth expects
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
      // first time, attach role
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      // Attach custom properties directly to session.user (TypeScript will warn, but runtime is fine)
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  secret: nextAuthSecret,
});

// for App Router
export { handler as GET, handler as POST };
