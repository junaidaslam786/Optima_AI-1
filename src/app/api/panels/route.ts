import { NextResponse } from "next/server";
import { supabaseAdmin }  from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("panels").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const panel = await request.json();
  const { data, error } = await supabaseAdmin
    .from("panels")
    .insert(panel)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
