import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch a single partner product by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("partner_products")
      .select(
        "*, partner_profiles(company_name), admin_products(name, base_price)"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        `Error fetching partner product with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching partner product by ID:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update a partner product by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("partner_products")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        `Error updating partner product with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error updating partner product:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a partner product by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("partner_products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        `Error deleting partner product with ID ${id}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error deleting partner product:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
