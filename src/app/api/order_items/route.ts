import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all order items (can be filtered by order_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");

    let query = supabaseAdmin
      .from("order_items")
      .select("*, partner_products(partner_name, partner_price)");
    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching order items:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error fetching order items:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new order item (or multiple order items in a batch)
// This endpoint expects an array of order items for batch insertion.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Allow for single object or array of objects
    const itemsToInsert = Array.isArray(body) ? body : [body];

    for (const item of itemsToInsert) {
      if (
        !item.order_id ||
        !item.partner_product_id ||
        !item.quantity ||
        !item.price_at_purchase
      ) {
        return NextResponse.json(
          { error: "Missing required fields for order item" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("order_items")
      .insert(itemsToInsert)
      .select();

    if (error) {
      console.error("Error creating order item(s):", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error creating order item(s):", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
