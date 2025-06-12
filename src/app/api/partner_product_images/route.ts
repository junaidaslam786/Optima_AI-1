import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all partner product images (can be filtered by partner_product_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerProductId = searchParams.get("partner_product_id");

    let query = supabaseAdmin.from("partner_product_images").select("*");
    if (partnerProductId) {
      query = query.eq("partner_product_id", partnerProductId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching partner product images:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching partner product images:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Add a new image for a partner product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.partner_product_id || !body.image_url) {
      return NextResponse.json(
        { error: "Missing required fields for partner product image" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("partner_product_images")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating partner product image:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error creating partner product image:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
