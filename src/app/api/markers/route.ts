// src/app/api/markers/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/markers → return every marker in the table
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("markers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching markers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/markers → create a standalone marker
export async function POST(request: Request) {
  const payload = await request.json();

  const { data, error } = await supabaseAdmin
    .from("markers")
    .insert(payload)
    .single();

  if (error) {
    console.error("Error inserting marker:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
