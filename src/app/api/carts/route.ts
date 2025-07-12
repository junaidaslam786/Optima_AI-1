import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("carts")
            .select("*");

        if (error) {
            console.error("Error fetching all carts:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching all carts:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: "Missing required field: user_id" },
                { status: 400 },
            );
        }

        const { data: existingCart, error: existingCartError } =
            await supabaseAdmin
                .from("carts")
                .select("id")
                .eq("user_id", user_id)
                .single();

        if (existingCartError && existingCartError.code !== "PGRST116") {
            console.error(
                "Error checking for existing cart:",
                existingCartError.message,
            );
            return NextResponse.json({ error: existingCartError.message }, {
                status: 500,
            });
        }

        if (existingCart) {
            return NextResponse.json(
                {
                    message: "User already has an active cart",
                    cart: existingCart,
                },
                { status: 200 },
            );
        }

        const { data, error } = await supabaseAdmin
            .from("carts")
            .insert([{ user_id }])
            .select()
            .single();

        if (error) {
            console.error("Error creating cart:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error creating cart:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
