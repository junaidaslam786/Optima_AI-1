// app/api/patient-marker-values/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin"; // Assuming this path is correct

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("patient_marker_values")
      .select("*");

    if (error) {
      console.error("Error fetching all patient marker values:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(
      "Unexpected error in GET /api/patient-marker-values:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.csvfile_id ||
      !body.user_id ||
      !body.marker_id ||
      !body.col_date ||
      !body.rep_date ||
      body.value === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields for patient marker value (csvfile_id, user_id, marker_id, col_date, rep_date, value)",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("patient_marker_values")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating patient marker value:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(
      "Unexpected error creating patient marker value:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
