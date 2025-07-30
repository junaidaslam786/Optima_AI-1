import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin"; // Assuming this path is correct
import { PostCategoryJunction } from "../route";
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select(
        `
        *,
        post_category_junction(
          category_id,
          blog_post_categories(name, slug)
        ),
        author:users(id, name, email)
      `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error(
        `Error fetching blog post with slug ${slug}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const formattedData = {
      ...data,
      categories: data.post_category_junction.map((junction: PostCategoryJunction) => ({
        id: junction.blog_post_categories.id,
        name: junction.blog_post_categories.name,
        slug: junction.blog_post_categories.slug,
      })),
      author: data.author,
      post_category_junction: undefined,
    };

    return NextResponse.json(formattedData, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching blog post by slug:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    
    // Check if the request contains FormData (for file uploads) or JSON
    const contentType = request.headers.get("content-type");
    
    let body: Record<string, unknown>;
    let category_ids: string[] | undefined;
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData for file uploads
      const formData = await request.formData();
      
      body = {
        title: formData.get("title") as string || undefined,
        excerpt: formData.get("excerpt") as string || undefined,
        author_id: formData.get("author_id") as string || undefined,
        published_at: formData.get("published_at") as string || undefined,
        is_published: formData.get("is_published") === "true",
        seo_meta_title: formData.get("seo_meta_title") as string || undefined,
        seo_meta_description: formData.get("seo_meta_description") as string || undefined,
        featured_image_url: formData.get("featured_image_url") as string || undefined,
      };
      
      // Handle category_ids
      const category_ids_raw = formData.get("category_ids") as string | null;
      category_ids = category_ids_raw ? category_ids_raw.split(',').map(id => id.trim()).filter(id => id) : undefined;
      
      // Handle file upload if present
      const contentFile = formData.get("content_file") as File | null;
      if (contentFile) {
        const fileExtension = contentFile.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `blogPostFiles/${uniqueFileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('blogPostFiles')
          .upload(filePath, contentFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading content file to Supabase Storage:", uploadError.message);
          return NextResponse.json(
            { error: "Failed to upload content file.", details: uploadError.message },
            { status: 500 }
          );
        }

        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('blogPostFiles')
          .getPublicUrl(filePath);

        if (publicUrlData) {
          body.content_path = publicUrlData.publicUrl;
        }
      }
      
      // Remove undefined values
      Object.keys(body).forEach(key => {
        if (body[key] === undefined || body[key] === null || body[key] === "") {
          delete body[key];
        }
      });
      
    } else {
      // Handle JSON request (original behavior)
      const jsonData = await request.json();
      ({ category_ids, ...body } = jsonData);
    }

    const { data: updatedPost, error: postError } = await supabaseAdmin
      .from("blog_posts")
      .update(body)
      .eq("slug", slug)
      .select()
      .single();

    if (postError) {
      console.error(
        `Error updating blog post with slug ${slug}:`,
        postError.message
      );
      return NextResponse.json({ error: postError.message }, { status: 500 });
    }

    if (category_ids !== undefined) {
      const { data: postIdData, error: postIdError } = await supabaseAdmin
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .single();

      if (postIdError || !postIdData) {
        console.error(
          `Could not find post ID for slug ${slug} to update categories:`,
          postIdError?.message
        );
        return NextResponse.json(
          {
            error: "Blog post updated, but failed to find post ID for category update.",
            details: postIdError?.message,
          },
          { status: 500 }
        );
      }

      const postId = postIdData.id;

      const { error: deleteError } = await supabaseAdmin
        .from("post_category_junction")
        .delete()
        .eq("post_id", postId);

      if (deleteError) {
        console.error(
          `Error deleting existing categories for blog post ${postId}:`,
          deleteError.message
        );
        return NextResponse.json(
          {
            error: "Blog post updated, but failed to clear existing categories.",
            details: deleteError.message,
          },
          { status: 500 }
        );
      }

      if (category_ids.length > 0) {
        const junctionInserts = category_ids.map((categoryId: string) => ({
          post_id: postId,
          category_id: categoryId,
        }));

        const { error: insertError } = await supabaseAdmin
          .from("post_category_junction")
          .insert(junctionInserts);

        if (insertError) {
          console.error(
            `Error inserting new categories for blog post ${postId}:`,
            insertError.message
          );
          return NextResponse.json(
            {
              error: "Blog post updated, but failed to link new categories.",
              details: insertError.message,
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error updating blog post:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error(
        `Error deleting blog post with slug ${slug}:`,
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error deleting blog post:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}