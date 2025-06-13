import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("partner_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        `Error fetching partner profile with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching partner profile by ID:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const updates = await request.json();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("partner_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (profileError) {
      console.error(
        `Error updating partner profile ${id}:`,
        profileError.message
      );
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    if (updates.partner_status === "approved" && profile.user_id) {
      const { error: userError } = await supabaseAdmin
        .from("users")
        .update({ role: "partner" })
        .eq("id", profile.user_id);

      if (userError) {
        console.error(
          `Error updating user ${profile.user_id} role:`,
          userError.message
        );
      }
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error in PATCH /partner_profiles/[id]:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a partner profile by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("partner_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        `Error deleting partner profile with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error deleting partner profile:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
