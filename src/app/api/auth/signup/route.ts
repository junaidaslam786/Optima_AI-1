import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hash } from "bcrypt";

// Use service-role so we can insert past RLS
const supabaseSrv = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password, name, role, dob, address, subscription } =
    await req.json();

  // 1) hash the password
  const password_hash = await hash(password, 10);

  // 2) insert into next_auth.users
  const { data, error } = await supabaseSrv
    .from("users")
    .insert({
      email,
      password_hash,
      name,
      role,
      dob: dob || null,
      address: address || null,
      subscription: subscription || null,
    })
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
