import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } },
): Promise<NextResponse> {
    try {
        const { id } = params;
        const body = await request.json();
        const { quantity } = body;

        if (quantity === undefined || quantity <= 0) {
            return NextResponse.json(
                { error: "Invalid quantity: must be a positive number" },
                { status: 400 },
            );
        }

        const { data, error } = await supabaseAdmin
            .from("cart_items")
            .update({ quantity })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error(
                `Error updating cart item ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error updating cart item:",
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
    { params }: { params: { id: string } },
): Promise<NextResponse> {
    try {
        const { id } = params;

        const { error } = await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("id", id);

        if (error) {
            console.error(
                `Error deleting cart item ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ deleted: true }, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error deleting cart item:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
