import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const { data, error } = await supabaseAdmin
            .from("transactions")
            .select(`
        *,
        users ( id, email ),
        orders!transactions_order_id_fkey ( id, total_amount, order_status )
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error(
                `Error fetching transaction with ID ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching transaction by ID:",
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
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;
        const body = await request.json();
        const { transaction_status, error_message } = body;

        if (!transaction_status) {
            return NextResponse.json(
                { error: "Missing required field: transaction_status" },
                { status: 400 },
            );
        }

        const { data, error } = await supabaseAdmin
            .from("transactions")
            .update({ transaction_status, error_message })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error(
                `Error updating transaction ${id}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error updating transaction:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
