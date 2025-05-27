// src/app/api/panels/[panelId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: Request,
  { params }: { params: { panelId: string } }
) {
  const { data, error } = await supabaseAdmin
    .from("panels")
    .select("*")
    .eq("id", params.panelId)
    .single();

  if (error) {
    // Not found
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: { panelId: string } }
) {
  const updates = await request.json();
  const { data, error } = await supabaseAdmin
    .from("panels")
    .update(updates)
    .eq("id", params.panelId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { panelId: string } }
) {
  const { error } = await supabaseAdmin
    .from("panels")
    .delete()
    .eq("id", params.panelId);

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Panel deleted" }, { status: 204 });
}
