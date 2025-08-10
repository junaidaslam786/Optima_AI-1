import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { passwordResetEmailTemplate, sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { email, redirectTo } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required to reset password." },
                { status: 400 },
            );
        }
        const finalRedirectTo =
            redirectTo || `${request.headers.get("origin")}/auth/update-password`;

        // Generate a Supabase recovery link, then email it via Gmail
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: finalRedirectTo },
        });

        const actionLink =
            // supabase-js v2 may return either top-level action_link or under properties
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data as any)?.action_link || (data as any)?.properties?.action_link;

        if (error || !actionLink) {
            console.error(
                "Error generating password reset link:",
                error?.message || "missing action_link"
            );
            return NextResponse.json(
                {
                    message:
                        "If an account with that email exists, a password reset link has been sent.",
                },
                { status: 200 }
            );
        }

        const template = passwordResetEmailTemplate({
            name: null,
            resetLink: actionLink,
            expiresInMinutes: 60,
        });

        await sendMail({ to: email, subject: template.subject, html: template.html, text: template.text });

        return NextResponse.json(
            { message: "Password reset email sent successfully. Check your inbox." },
            { status: 200 }
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
