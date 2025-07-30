import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
    try {
        // Get the access token from the Authorization header
        const authHeader = request.headers.get("Authorization");
        const accessToken = authHeader?.split("Bearer ")[1];

        if (!accessToken) {
            return NextResponse.json(
                { error: "Authorization token is missing." },
                { status: 401 }
            );
        }

        const { newPassword } = await request.json();

        // Validate that a new password is provided
        if (!newPassword) {
            return NextResponse.json(
                { error: "New password is required." },
                { status: 400 }
            );
        }

        // Decode the user from the access token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
        if (userError || !user) {
            return NextResponse.json(
                { error: "Invalid or expired access token." },
                { status: 401 }
            );
        }

        const { data: userUpdateData, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (error) {
            console.error("Error changing password:", error.message);
            return NextResponse.json(
                { error: `Failed to change password: ${error.message}` },
                { status: 400 } // Use 400 for client-side errors like invalid token/password
            );
        }

        // Success response
        return NextResponse.json(
            { message: "Password changed successfully!", user: userUpdateData?.user },
            { status: 200 }
        );
    } catch (err: unknown) {
        // Catch any unexpected errors during the process
        console.error(
            "Unexpected error in change password route:",
            (err as Error).message
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}