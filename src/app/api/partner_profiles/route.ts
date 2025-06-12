import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all partner profiles
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("partner_profiles").select("*");

    if (error) {
      console.error("Error fetching partner profiles:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error fetching partner profiles:", (err as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new partner profile (e.g., upon registration or admin creation)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.user_id || !body.company_name || !body.company_slug || !body.contact_email) {
      return NextResponse.json({ error: "Missing required fields for partner profile" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("partner_profiles").insert([body]).select().single();

    if (error) {
      console.error("Error creating partner profile:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error creating partner profile:", (err as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}