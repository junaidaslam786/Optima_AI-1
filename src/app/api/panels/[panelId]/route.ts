import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ panelId: string }> }
): Promise<NextResponse> {
  const { panelId } = await params;

  const { data, error } = await supabaseAdmin
    .from("panels")
    .select("*")
    .eq("id", panelId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ panelId: string }> }
): Promise<NextResponse> {
  const { panelId } = await params;
  const updates = await request.json();

  const { data, error } = await supabaseAdmin
    .from("panels")
    .update(updates)
    .eq("id", panelId)
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
  request: NextRequest,
  { params }: { params: Promise<{ panelId: string }> }
): Promise<NextResponse> {
  const { panelId } = await params;

  const { error } = await supabaseAdmin
    .from("panels")
    .delete()
    .eq("id", panelId);

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
