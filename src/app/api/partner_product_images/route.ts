import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerProductId = searchParams.get("partner_product_id");

    let query = supabaseAdmin.from("partner_product_images").select("*");
    if (partnerProductId) {
      query = query.eq("partner_product_id", partnerProductId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching partner product images:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching partner product images:",
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

    let partner_product_id: string | null = null;
    let image_url: string | null = null;
    let is_thumbnail: boolean = false;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();

      partner_product_id = form.get("partner_product_id") as string | null;
      const file = form.get("image") as File | null;
      const isThumbnailString = form.get("is_thumbnail") as string;
      is_thumbnail = isThumbnailString === "true";
      if (!partner_product_id || !file) {
        return NextResponse.json(
          { error: "Missing partner_product_id or image file" },
          { status: 400 }
        );
      }

      const filename = `${Date.now()}-${file.name}`;
      const uploadPath = `partner_product_images/${partner_product_id}/${filename}`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("product-images")
        .upload(uploadPath, file);

      if (uploadErr) {
        console.error("Supabase Storage Upload Error:", uploadErr.message);
        return NextResponse.json({ error: `Image upload failed: ${uploadErr.message}` }, { status: 500 });
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(uploadPath);

      if (!urlData || !urlData.publicUrl) {
        return NextResponse.json(
          { error: "Could not get public URL for uploaded image" },
          { status: 500 }
        );
      }

      image_url = urlData.publicUrl;

    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      partner_product_id = body.partner_product_id;
      image_url = body.image_url;
      is_thumbnail = body.is_thumbnail === true;

      if (!partner_product_id || !image_url) {
        return NextResponse.json(
          { error: "Missing partner_product_id or image_url" },
          { status: 400 }
        );
      }
    } else {
        return NextResponse.json(
            { error: "Unsupported Content-Type" },
            { status: 415 }
        );
    }

    const { data, error: dbInsertError } = await supabaseAdmin
      .from("partner_product_images")
      .insert([{ partner_product_id, image_url, is_thumbnail }])
      .select()
      .single();

    if (dbInsertError) {
      console.error("DB insert error for partner product image:", dbInsertError.message);
      return NextResponse.json({ error: dbInsertError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error("Unexpected error in partner product image POST:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
