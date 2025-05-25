import { NextResponse } from "next/server";
import { supabaseAdmin }  from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { user_id, filename } = await request.json();
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .insert({ user_id, filename })
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const { data, error } = await supabaseAdmin.from("uploads").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
