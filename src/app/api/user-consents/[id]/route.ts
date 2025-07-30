import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
    try {
        const { userId } = await params;
        const { searchParams } = new URL(request.url);
        const consentType = searchParams.get("consent_type");
        const latestOnly = searchParams.get("latest_only") === "true";
        let query = supabaseAdmin
            .from("user_consents")
            .select("*")
            .eq("user_id", userId)
            .order("consent_timestamp", { ascending: false });

        if (consentType) {
            query = query.eq("consent_type", consentType);
        }

        if (latestOnly) {
            query = query.limit(1);
        }

        const { data, error } = await query;

        if (error) {
            console.error(
                `Error fetching consent records for user ${userId}:`,
                error.message,
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (latestOnly && data && data.length > 0) {
            return NextResponse.json(data[0], { status: 200 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: unknown) {
        console.error(
            "Unexpected error fetching user consent history:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
