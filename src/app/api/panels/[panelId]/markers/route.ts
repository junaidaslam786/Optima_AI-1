// src/app/api/panels/[panelId]/markers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest, { params }) {
  try {
    // Query markers table with panel_id foreign key
    const { data, error } = await supabaseAdmin
      .from("markers")
      .select("*")
      .eq("panel_id", params.panelId); // Changed from 'id' to 'panel_id'

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
