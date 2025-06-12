import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all orders (can be filtered by customer_user_id or partner_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerUserId = searchParams.get("customer_user_id");
    const partnerId = searchParams.get("partner_id");

    let query = supabaseAdmin.from("orders").select("*, users(name, email), partner_profiles(company_name)");
    if (customerUserId) {
      query = query.eq("customer_user_id", customerUserId);
    }
    if (partnerId) {
      query = query.eq("partner_id", partnerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error fetching orders:", (err as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customer_user_id || !body.partner_id || !body.total_amount || !body.currency) {
      return NextResponse.json({ error: "Missing required fields for order" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("orders").insert([body]).select().single();

    if (error) {
      console.error("Error creating order:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error creating order:", (err as Error).message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}