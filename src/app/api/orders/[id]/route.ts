import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        users ( id, email, name, phone ),
        partner_profiles ( id, company_name, contact_email ),
        order_items (
          id,
          quantity,
          price_at_purchase,
          partner_products ( id, partner_name, partner_description, thumbnail_url, partner_price, admin_product_id )
        ),
        shipping_details ( * ),
        transactions ( * )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        `Error fetching order with ID ${id}:`,
        error.message,
      );
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching order by ID:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { order_status, payment_status, tracking_number } = body;

    const updateData: {
      order_status?: string;
      payment_status?: string;
    } = {};

    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        `Error updating order with ID ${id}:`,
        error.message,
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (tracking_number !== undefined) {
      const { error: shippingUpdateError } = await supabaseAdmin
        .from("shipping_details")
        .update({ tracking_number: tracking_number })
        .eq("order_id", id);

      if (shippingUpdateError) {
        console.error(
          `Error updating shipping details for order ${id}:`,
          shippingUpdateError.message,
        );
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error updating order:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
