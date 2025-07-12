import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
    try {
        const { userId } = await params;

        const { data, error } = await supabaseAdmin
            .from("carts")
            .select(`
        id,
        user_id,
        created_at,
        updated_at,
        cart_items (
          id,
          partner_product_id,
          quantity,
          price_at_addition,
          partner_products (
            id,
            partner_name,
            partner_description,
            partner_price,
            thumbnail_url
          )
        )
      `)
            .eq("user_id", userId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({
                    error: "Cart not found for this user.",
                }, { status: 404 });
            }
            console.error(
                `Error fetching cart for user ${userId}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching user cart by ID:",
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
    { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
    try {
        const { userId } = await params;

        const { error } = await supabaseAdmin
            .from("carts")
            .delete()
            .eq("user_id", userId);

        if (error) {
            console.error(
                `Error deleting cart for user ${userId}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ deleted: true }, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error deleting cart:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
