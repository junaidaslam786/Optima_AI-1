import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("transactions")
            .select(`
        *,
        users ( id, email ),
        orders!transactions_order_id_fkey ( id, total_amount, order_status )
      `);

        if (error) {
            console.error("Error fetching all transactions:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching all transactions:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
