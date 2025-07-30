import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { email, redirectTo } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required to reset password." },
                { status: 400 },
            );
        }
        const finalRedirectTo = redirectTo ||
            `${request.headers.get("origin")}/auth/update-password`;

        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: finalRedirectTo,
            },
        );

        if (error) {
            console.error("Error sending password reset email:", error.message);
            return NextResponse.json(
                {
                    message:
                        "If an account with that email exists, a password reset link has been sent.",
                },
                { status: 200 },
            );
        }

        return NextResponse.json(
            {
                message:
                    "Password reset email sent successfully. Check your inbox.",
            },
            { status: 200 },
        );
    } catch (err: unknown) {
        console.error(
            "Unexpected error in forgot password route:",
            (err as Error).message,
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
