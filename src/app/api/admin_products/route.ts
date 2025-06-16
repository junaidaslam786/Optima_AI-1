import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all admin products
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("admin_products").select("*");

    if (error) {
      console.error("Error fetching admin products:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error fetching admin products:", (err as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new admin product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.base_price || !body.sku) {
      return NextResponse.json({ error: "Missing required fields for admin product" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("admin_products").insert([body]).select().single();

    if (error) {
      console.error("Error creating admin product:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error creating admin product:", (err as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}