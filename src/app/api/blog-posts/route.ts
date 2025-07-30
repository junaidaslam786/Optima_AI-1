import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content_path: string;
  author_id: string;
  published_at: string;
  is_published: boolean;
  seo_meta_title?: string;
  seo_meta_description?: string;
  featured_image_url?: string;
  post_category_junction: {
    category_id: string;
    blog_post_categories: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PostCategoryJunction {
  category_id: string;
  blog_post_categories: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category_slug");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    let query = supabaseAdmin
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
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (categorySlug) {
      query = query.filter(
        "post_category_junction.blog_post_categories.slug",
        "eq",
        categorySlug
      );
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }
    if (offset) {
      query = query.range(parseInt(offset, 10), parseInt(offset, 10) + (parseInt(limit || '10', 10) - 1));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = data.map((post: BlogPost) => ({
      ...post,
      categories: post.post_category_junction.map((junction: PostCategoryJunction) => ({
        id: junction.blog_post_categories.id,
        name: junction.blog_post_categories.name,
        slug: junction.blog_post_categories.slug,
      })),
      author: post.author,
      post_category_junction: undefined,
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error fetching blog posts:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new blog post (Admin only)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      title,
      slug,
      excerpt,
      content_path,
      author_id,
      published_at,
      is_published,
      seo_meta_title,
      seo_meta_description,
      featured_image_url,
      category_ids,
    } = await request.json();

    if (!title || !slug || !content_path || !author_id) {
      return NextResponse.json(
        { error: "Missing required fields for blog post" },
        { status: 400 }
      );
    }

    const { data: newPost, error: postError } = await supabaseAdmin
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt,
        content_path,
        author_id,
        published_at: published_at || new Date().toISOString(),
        is_published: is_published !== undefined ? is_published : false,
        seo_meta_title,
        seo_meta_description,
        featured_image_url,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating blog post:", postError.message);
      return NextResponse.json({ error: postError.message }, { status: 500 });
    }

    if (category_ids && category_ids.length > 0) {
      const junctionInserts = category_ids.map((categoryId: string) => ({
        post_id: newPost.id,
        category_id: categoryId,
      }));

      const { error: junctionError } = await supabaseAdmin
        .from("post_category_junction")
        .insert(junctionInserts);

      if (junctionError) {
        console.error(
          "Error linking blog post to categories:",
          junctionError.message
        );
        return NextResponse.json(
          {
            error: "Blog post created, but failed to link categories.",
            details: junctionError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (err: unknown) {
    console.error(
      "Unexpected error creating blog post:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}