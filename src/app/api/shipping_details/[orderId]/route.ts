import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> },
): Promise<NextResponse> {
    try {
        const { orderId } = await params;

        const { data, error } = await supabaseAdmin
            .from("shipping_details")
            .select("*")
            .eq("order_id", orderId)
            .single();

        if (error) {
            console.error(
                `Error fetching shipping details for order ${orderId}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching shipping details:",
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
    { params }: { params: Promise<{ orderId: string }> },
): Promise<NextResponse> {
    try {
        const { orderId } = await params;
        const body = await request.json();
        const { tracking_number, tracking_url, shipped_at, delivered_at } =
            body;

        const updateData: Partial<{
            tracking_number: string;
            tracking_url: string;
            shipped_at: string;
            delivered_at: string;
        }> = {};
        if (tracking_number !== undefined) {
            updateData.tracking_number = tracking_number;
        }
        if (tracking_url !== undefined) updateData.tracking_url = tracking_url;
        if (shipped_at !== undefined) updateData.shipped_at = shipped_at;
        if (delivered_at !== undefined) updateData.delivered_at = delivered_at;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields provided for update." },
                { status: 400 },
            );
        }

        const { data, error } = await supabaseAdmin
            .from("shipping_details")
            .update(updateData)
            .eq("order_id", orderId)
            .select()
            .single();

        if (error) {
            console.error(
                `Error updating shipping details for order ${orderId}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error updating shipping details:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
