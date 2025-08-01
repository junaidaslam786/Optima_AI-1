import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_products")
      .select("*");

    if (error) {
      console.error("Error fetching admin products:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching admin products:",
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

    if (!body.name || !body.base_price) {
      return NextResponse.json(
        {
          error: "Missing required fields (name, base_price) for admin product",
        },
        { status: 400 }
      );
    }

    const newProductData = {
      name: body.name,
      description: body.description,
      base_price: body.base_price,
      sku: body.sku,
      category_ids: body.category_ids || [],
      intended_use: body.intended_use,
      test_type: body.test_type,
      marker_ids: body.marker_ids || [],
      result_timeline: body.result_timeline,
      additional_test_information: body.additional_test_information,
      corresponding_panels: body.corresponding_panels || [],
      admin_user_id: body.admin_user_id,
    };

    const { data, error } = await supabaseAdmin
      .from("admin_products")
      .insert([newProductData])
      .select()
      .single();

    if (error) {
      console.error("Error creating admin product:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(
      "Unexpected error creating admin product:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
