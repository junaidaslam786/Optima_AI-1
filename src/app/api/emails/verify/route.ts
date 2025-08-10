import { NextRequest, NextResponse } from "next/server";
import { sendMail, emailVerificationTemplate } from "@/lib/mailer";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required." },
                { status: 400 }
            );
        }

        // Generate verification link (you can customize this logic)
        const verificationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        const verificationLink = `${request.headers.get("origin") || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;

        // Send beautiful verification email
        const template = emailVerificationTemplate({
            name: name || "User",
            verificationLink,
            expiresInHours: 24
        });

        await sendMail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text
        });

        console.log(`Email verification sent to ${email}`);

        return NextResponse.json(
            { 
                message: "Verification email sent successfully! Please check your inbox.",
                verificationToken // You might want to store this in your database
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to send verification email:", error);
        return NextResponse.json(
            { error: "Failed to send verification email." },
            { status: 500 }
        );
    }
}
