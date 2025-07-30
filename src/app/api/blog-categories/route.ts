import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin"; // Assuming this path is correct

// GET: Fetch all blog categories
export async function GET(): Promise<NextResponse> {
    try {
        const { data, error } = await supabaseAdmin
            .from("blog_post_categories")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching blog categories:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching blog categories:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { name, slug, description } = await request.json();

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Missing required fields: name and slug" },
                { status: 400 },
            );
        }

        const { data, error } = await supabaseAdmin
            .from("blog_post_categories")
            .insert({ name, slug, description })
            .select()
            .single();

        if (error) {
            console.error("Error creating blog category:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error creating blog category:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
