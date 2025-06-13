import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Fetch all admin product images (can be filtered by product_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    let query = supabaseAdmin.from("admin_product_images").select("*");
    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching admin product images:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching admin product images:",
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
    const contentType = request.headers.get("content-type") || "";

    let product_id: string | null = null;
    let image_url: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      product_id = form.get("product_id") as string | null;
      const file = form.get("file") as File | null;

      if (!product_id || !file) {
        return NextResponse.json(
          { error: "Missing product_id or file upload" },
          { status: 400 }
        );
      }

      // prefix filename with timestamp to avoid collisions
      const filename = `${Date.now()}-${file.name}`;
      const uploadPath = `images/${filename}`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("product-images")
        .upload(uploadPath, file);

      if (uploadErr) {
        console.error("Storage upload error:", uploadErr.message);
        return NextResponse.json({ error: uploadErr.message }, { status: 500 });
      }

      // get a public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(uploadPath);

      image_url = urlData.publicUrl;
    } else {
      // JSON path
      const body = await request.json();
      product_id = body.product_id;
      image_url = body.image_url;
      if (!product_id || !image_url) {
        return NextResponse.json(
          { error: "Missing product_id or image_url" },
          { status: 400 }
        );
      }
    }

    // insert into table
    const { data, error } = await supabaseAdmin
      .from("admin_product_images")
      .insert([{ product_id, image_url }])
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
