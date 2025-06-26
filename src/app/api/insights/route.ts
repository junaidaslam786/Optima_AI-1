// src/app/api/insights/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data: insightRaw, error: iErr } =
      await supabaseAdmin.functions.invoke("generate-insights", {
        body: { user_id: userId },
      });

    if (iErr) {
      console.error("Insights function error:", iErr);
      return NextResponse.json(
        { error: iErr.message || "Failed to generate insights" },
        { status: 500 }
      );
    }

    return NextResponse.json(insightRaw);
  } catch (error: unknown) {
    console.error("API route error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
