import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch a single admin product by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("admin_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        `Error fetching admin product with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching admin product by ID:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update an admin product by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("admin_products")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        `Error updating admin product with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error updating admin product:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an admin product by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("admin_products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        `Error deleting admin product with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error deleting admin product:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
