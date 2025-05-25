import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(_request: Request, { params }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("panels")
      .select("*")
      .eq("id", params.panelId)
      .single();

    if (error) {
      // Handle "no results" vs. other errors
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Panel not found" }, { status: 404 });
      }
      throw error; // Trigger catch block for other errors
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching panel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
