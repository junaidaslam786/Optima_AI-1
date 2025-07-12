import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PostgrestError } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, partner_product_id, quantity } = body;

    if (!user_id || !partner_product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid required fields: user_id, partner_product_id, quantity (must be > 0)",
        },
        { status: 400 },
      );
    }

    let { data: cart, error: cartError }: {
      data: { id: string } | null;
      error: PostgrestError | null;
    } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (cartError && cartError.code === "PGRST116") {
      const { data: newCart, error: newCartError } = await supabaseAdmin
        .from("carts")
        .insert([{ user_id }])
        .select("id")
        .single();
      if (newCartError) {
        console.error("Error creating cart for user:", newCartError.message);
        return NextResponse.json({ error: "Failed to create cart." }, {
          status: 500,
        });
      }
      cart = newCart;
      cartError = null;
    } else if (cartError) {
      console.error("Error fetching cart:", cartError.message);
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    const { data: productData, error: productError } = await supabaseAdmin
      .from("partner_products")
      .select("partner_price")
      .eq("id", partner_product_id)
      .single();

    if (productError || !productData) {
      console.error(
        `Error fetching partner product ${partner_product_id}:`,
        productError?.message,
      );
      return NextResponse.json({ error: "Product not found or invalid." }, {
        status: 404,
      });
    }

    const priceAtAddition = productData.partner_price;

    const { data: existingCartItem, error: fetchItemError } =
      await supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart!.id)
        .eq("partner_product_id", partner_product_id)
        .single();

    if (fetchItemError && fetchItemError.code !== "PGRST116") {
      console.error(
        "Error checking for existing cart item:",
        fetchItemError.message,
      );
      return NextResponse.json({ error: fetchItemError.message }, {
        status: 500,
      });
    }

    let resultData;
    let resultError;

    if (existingCartItem) {
      ({ data: resultData, error: resultError } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq("id", existingCartItem.id)
        .select()
        .single());
    } else {
      ({ data: resultData, error: resultError } = await supabaseAdmin
        .from("cart_items")
        .insert([
          {
            cart_id: cart!.id,
            partner_product_id,
            quantity,
            price_at_addition: priceAtAddition,
          },
        ])
        .select()
        .single());
    }

    if (resultError) {
      console.error("Error adding/updating cart item:", resultError.message);
      return NextResponse.json({ error: resultError.message }, { status: 500 });
    }

    return NextResponse.json(resultData, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error adding item to cart:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
