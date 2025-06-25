import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("patient_marker_values")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        `Error fetching patient marker value with ID ${id}:`,
        error.message
      );
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(
      "Unexpected error fetching patient marker value by ID:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("patient_marker_values")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        `Error updating patient marker value with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(
      "Unexpected error updating patient marker value:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("patient_marker_values")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        `Error deleting patient marker value with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err) {
    console.error(
      "Unexpected error deleting patient marker value:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
