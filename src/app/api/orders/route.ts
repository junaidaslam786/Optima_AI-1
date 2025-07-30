import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
                *,
                users ( id, email, name ),
                partner_profiles ( id, company_name ),
                order_items (
                    id,
                    quantity,
                    price_at_purchase,
                    partner_products ( id, partner_name, thumbnail_url )
                ),
                shipping_details ( * ),
                transactions!orders_primary_transaction_id_fkey ( * )
            `);

    if (error) {
      console.error("Error fetching all orders:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching all orders:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cart_id,
      user_email,
      user_name,
      shipping_details,
      payment_method_id,
      partner_id,
    } = body;

    if (
      !cart_id || !user_email || !shipping_details || !payment_method_id ||
      !partner_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields for order creation." },
        { status: 400 },
      );
    }
    const { data: cartData, error: cartError } = await supabaseAdmin
      .from("carts")
      .select(`
                id,
                user_id,
                cart_items (
                    partner_product_id,
                    quantity,
                    price_at_addition
                )
            `)
      .eq("id", cart_id)
      .single();

    if (
      cartError || !cartData || !cartData.cart_items ||
      cartData.cart_items.length === 0
    ) {
      console.error(
        "Error fetching cart or cart is empty:",
        cartError?.message || "Cart empty.",
      );
      return NextResponse.json({ error: "Cart not found or empty." }, {
        status: 404,
      });
    }

    const { user_id: existing_user_id, cart_items } = cartData;

    let customer_user_id = existing_user_id;
    if (!customer_user_id) {
      const { data: existingUser, error: fetchUserError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", user_email)
        .single();

      if (fetchUserError && fetchUserError.code !== "PGRST116") {
        console.error(
          "Error checking for existing user:",
          fetchUserError.message,
        );
        return NextResponse.json({ error: "Failed to check user existence." }, {
          status: 500,
        });
      }

      if (existingUser) {
        customer_user_id = existingUser.id;
      } else {
        const { data: newUser, error: newUserError } = await supabaseAdmin
          .from("users")
          .insert([
            {
              email: user_email,
              name: user_name || "Guest User",
              role: "client",
              password_hash: null,
            },
          ])
          .select("id")
          .single();

        if (newUserError) {
          console.error(
            "Error creating new user for guest:",
            newUserError.message,
          );
          return NextResponse.json({ error: "Failed to create user." }, {
            status: 500,
          });
        }
        customer_user_id = newUser.id;
      }
    }

    let total_amount = 0;
    for (const item of cart_items) {
      total_amount += item.quantity * item.price_at_addition;
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_user_id: customer_user_id,
          partner_id: partner_id,
          total_amount: total_amount,
          currency: "GBP",
          order_status: "pending",
          payment_status: "pending",
        },
      ])
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("Error creating order:", orderError?.message);
      return NextResponse.json({ error: "Failed to create order." }, {
        status: 500,
      });
    }

    const new_order_id = orderData.id;

    const orderItemsToInsert = cart_items.map((item) => ({
      order_id: new_order_id,
      partner_product_id: item.partner_product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_addition,
      admin_revenue_share: null,
      partner_revenue_share: null,
    }));

    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert);

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError.message);
      await supabaseAdmin.from("orders").delete().eq("id", new_order_id);
      return NextResponse.json({ error: "Failed to create order items." }, {
        status: 500,
      });
    }

    const { error: shippingError } = await supabaseAdmin
      .from("shipping_details")
      .insert([
        {
          order_id: new_order_id,
          recipient_name: shipping_details.recipient_name,
          address_line1: shipping_details.address_line1,
          address_line2: shipping_details.address_line2,
          city: shipping_details.city,
          state_province: shipping_details.state_province,
          postal_code: shipping_details.postal_code,
          country: shipping_details.country,
          phone_number: shipping_details.phone_number,
          shipping_cost: shipping_details.shipping_cost || 0,
          shipping_method: shipping_details.shipping_method || "Standard",
        },
      ]);

    if (shippingError) {
      console.error("Error creating shipping details:", shippingError.message);
      await supabaseAdmin.from("orders").delete().eq("id", new_order_id);
      return NextResponse.json(
        { error: "Failed to create shipping details." },
        { status: 500 },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100),
      currency: "gbp",
      metadata: {
        order_id: new_order_id,
        user_id: customer_user_id,
      },
    });

    const { data: transactionData, error: transactionError } =
      await supabaseAdmin
        .from("transactions")
        .insert([
          {
            order_id: new_order_id,
            user_id: customer_user_id,
            transaction_amount: total_amount,
            currency: "GBP",
            payment_gateway: "Stripe",
            gateway_transaction_id: paymentIntent.id,
            transaction_status: "pending",
            transaction_type: "sale",
            error_message: paymentIntent.status === "requires_action"
              ? "Payment requires action"
              : paymentIntent.last_payment_error?.message || null,
          },
        ])
        .select("id")
        .single();

    if (transactionError || !transactionData) {
      console.error(
        "Error creating transaction record:",
        transactionError?.message,
      );
      return NextResponse.json({ error: "Failed to record transaction." }, {
        status: 500,
      });
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        primary_transaction_id: transactionData.id,
      })
      .eq("id", new_order_id);

    if (updateOrderError) {
      console.error(
        "Error updating order with transaction ID:",
        updateOrderError.message,
      );
    }

    await supabaseAdmin.from("carts").delete().eq("id", cart_id);

    return NextResponse.json(
      {
        order_id: new_order_id,
        clientSecret: paymentIntent.client_secret,
        paymentStatus: paymentIntent.status,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Unexpected error creating order:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error", details: (err as Error).message },
      { status: 500 },
    );
  }
}
