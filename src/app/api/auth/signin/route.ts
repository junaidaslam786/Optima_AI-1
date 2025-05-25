// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcrypt";

// Use service-role key, so you can bypass RLS on public.users
const supabaseSrv = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 1) Fetch the user row from public.users
  const { data: user, error } = await supabaseSrv
    .from("users")
    .select("id,email,name,role,dob,address,subscription,password_hash")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // 2) Compare the password
  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // 3) Return user data (minus the hash) and, if you want, a token
  //    If you’re managing your own JWTs, issue one here.
  //    If you’re using NextAuth, omit this route entirely and call `signIn(...)` on the client.
  const { password_hash: _, ...publicUser } = user;
  return NextResponse.json({ user: publicUser }, { status: 200 });
}
