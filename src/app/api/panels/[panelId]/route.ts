// src/app/api/panels/[panelId]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  // Directly destructure 'params' and type it here
  { params }: { params: { panelId: string } }
): Promise<NextResponse> {
  const panelId = params.panelId; // Now 'panelId' is directly available

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
  // Directly destructure 'params' and type it here
  { params }: { params: { panelId: string } }
): Promise<NextResponse> {
  const panelId = params.panelId; // Now 'panelId' is directly available
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
  _request: NextRequest,
  // Directly destructure 'params' and type it here
  { params }: { params: { panelId: string } }
): Promise<NextResponse> {
  const panelId = params.panelId; // Now 'panelId' is directly available

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