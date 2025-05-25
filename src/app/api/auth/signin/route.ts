// src/app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { compare }      from "bcrypt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id,email,name,role,dob,address,subscription,password_hash")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const publicUser = {
    id:           user.id,
    email:        user.email,
    name:         user.name,
    role:         user.role,
    dob:          user.dob,
    address:      user.address,
    subscription: user.subscription
  };

  return NextResponse.json({ user: publicUser }, { status: 200 });
}

