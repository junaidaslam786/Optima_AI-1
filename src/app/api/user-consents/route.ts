import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      user_id,
      consent_version,
      consent_type,
      agreed,
      ip_address,
      user_agent,
      notes,
    } = await request.json();

    if (!consent_version || !consent_type || agreed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields for consent record: consent_version, consent_type, agreed" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("user_consents")
      .insert({
        user_id,
        consent_version,
        consent_type,
        agreed,
        ip_address: ip_address || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: user_agent || request.headers.get('user-agent'),
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error recording user consent:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error recording user consent:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}