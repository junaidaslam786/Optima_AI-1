import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("partner_products")
      .select(
        "*, partner_profiles(company_name), admin_products(name, base_price)",
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        `Error fetching partner product with ID ${id}:`,
        error.message,
      );
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching partner product by ID:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT: Update a partner product by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;

    let formData: FormData | null = null;
    let isFormDataRequest = false;
    try {
      if (
        request.headers.get("content-type")?.includes("multipart/form-data")
      ) {
        formData = await request.formData();
        isFormDataRequest = true;
      }
    } catch {
      console.warn(
        "Failed to parse request as FormData, likely not an image upload.",
      );
    }

    if (isFormDataRequest && formData) {
      let imageUrlToSave: string | null = null;
      const isThumbnailFlag: boolean = formData.get("isThumbnail") === "true";

      const file = formData.get("file") as File | null;
      const imageUrl = formData.get("imageUrl") as string | null;

      if (file) {
        const bucketName = "product-images";
        const filePath = `partner_products/${id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined,
          });

        if (uploadError) {
          console.error(
            `Error uploading file to Supabase:`,
            uploadError.message,
          );
          return NextResponse.json(
            { error: `File upload failed: ${uploadError.message}` },
            { status: 500 },
          );
        }

        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          return NextResponse.json(
            { error: "Failed to get public URL for uploaded file." },
            { status: 500 },
          );
        }
        imageUrlToSave = publicUrlData.publicUrl;
      } else if (imageUrl) {
        imageUrlToSave = imageUrl;
      } else {
        return NextResponse.json(
          { error: "No image file or URL provided in form data." },
          { status: 400 },
        );
      }

      const { data: currentProduct, error: fetchError } = await supabaseAdmin
        .from("partner_products")
        .select("product_image_urls, thumbnail_url")
        .eq("id", id)
        .single();

      if (fetchError || !currentProduct) {
        console.error(
          `Error fetching current partner product for ID ${id}:`,
          fetchError?.message,
        );
        return NextResponse.json(
          {
            error: `Failed to fetch current partner product data: ${
              fetchError?.message || "Product not found"
            }`,
          },
          { status: 404 },
        );
      }

      const updatedProductImageUrls = new Set(
        currentProduct.product_image_urls || [],
      );
      let updatedThumbnailUrl = currentProduct.thumbnail_url;

      if (imageUrlToSave) {
        updatedProductImageUrls.add(imageUrlToSave);
        if (isThumbnailFlag) {
          updatedThumbnailUrl = imageUrlToSave;
        }
      }

      const { data, error } = await supabaseAdmin
        .from("partner_products")
        .update({
          product_image_urls: Array.from(updatedProductImageUrls),
          thumbnail_url: updatedThumbnailUrl,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(
          `Error updating partner product image URLs for ID ${id}:`,
          error.message,
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    } else {
      const body = await request.json();

      const { data, error } = await supabaseAdmin
        .from("partner_products")
        .update(body)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(
          `Error updating partner product with ID ${id}:`,
          error.message,
        );
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
    }
  } catch (err: unknown) {
    console.error(
      "Unexpected error in PATCH /api/partner_products/[id]:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("partner_products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        `Error deleting partner product with ID ${id}:`,
        error.message,
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error deleting partner product:",
      (err as Error).message,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
