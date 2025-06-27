//app/api/product-categories/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_categories")
      .select("*");

    if (error) {
      console.error("Error fetching all product categories:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(
      "Unexpected error in GET /api/product-categories:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Missing required field: name for product category" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("product_categories")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating product category:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(
      "Unexpected error creating product category:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
