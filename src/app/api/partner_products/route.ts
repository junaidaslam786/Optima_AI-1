import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all partner products (can be filtered by partner_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    let query = supabaseAdmin
      .from("partner_products")
      .select(
        "*, partner_profiles(company_name), admin_products(name, base_price)"
      );
    if (partnerId) {
      query = query.eq("partner_id", partnerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching partner products:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error fetching partner products:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new partner product listing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.partner_id || !body.admin_product_id || !body.partner_price) {
      return NextResponse.json(
        { error: "Missing required fields for partner product" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("partner_products")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating partner product:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error creating partner product:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
