// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hash }         from "bcrypt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password, name, role, dob, address, subscription } =
    await req.json();

  const password_hash = await hash(password, 10);

  const { error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      password_hash,
      name,
      role,
      dob:          dob || null,
      address:      address || null,
      subscription: subscription || null
    })
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}