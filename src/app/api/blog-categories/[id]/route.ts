import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin
            .from("blog_post_categories")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error(
                `Error fetching blog category with ID ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching blog category by ID:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from("blog_post_categories")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error(
                `Error updating blog category with ID ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error updating blog category:",
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
            .from("blog_post_categories")
            .delete()
            .eq("id", id);

        if (error) {
            console.error(
                `Error deleting blog category with ID ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ deleted: true }, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error deleting blog category:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
