import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all admin product images (can be filtered by product_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    let query = supabaseAdmin.from("admin_product_images").select("*");
    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching admin product images:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching admin product images:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Add a new image for an admin product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.product_id || !body.image_url) {
      return NextResponse.json(
        { error: "Missing required fields for admin product image" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("admin_product_images")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating admin product image:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error creating admin product image:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
