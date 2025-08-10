import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "gbp", orderData } = await req.json();

    if (!amount || amount < 50) { // Minimum 50p
      return NextResponse.json(
        { error: "Invalid amount. Minimum payment is £0.50" },
        { status: 400 }
      );
    }

    // Validate order data
    if (!orderData || !orderData.customer || !orderData.items) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    // Calculate and verify the amount by fetching current product prices from Supabase
    let calculatedAmount = 0;
    const supabase = supabaseAdmin;

    for (const item of orderData.items) {
      const { data: product, error } = await supabase
        .from('partner_products')
        .select('partner_price')
        .eq('id', item.partner_product_id)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.partner_product_id}` },
          { status: 400 }
        );
      }

      calculatedAmount += product.partner_price * item.quantity;
    }

    // Convert to pence and verify with provided amount
    const calculatedAmountInPence = Math.round(calculatedAmount * 100);
    
    if (Math.abs(calculatedAmountInPence - amount) > 1) { // Allow 1p difference for rounding
      return NextResponse.json(
        { error: "Amount mismatch. Please refresh and try again." },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedAmountInPence, // Use calculated amount for security
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customer_email: orderData.customer.email,
        customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
        guest_id: orderData.guestId || "",
        is_guest_order: orderData.isGuestOrder.toString(),
        items_count: orderData.items.length.toString(),
        calculated_amount: calculatedAmount.toString(),
      },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      amount: calculatedAmountInPence,
    });
  } catch (error) {
    console.error("Stripe payment intent creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
