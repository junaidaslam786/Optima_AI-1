// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hash } from "bcrypt";
import { sendMail, welcomeEmailTemplate } from "@/lib/mailer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password, name, role, dob, address, subscription } =
    await req.json();

  const password_hash = await hash(password, 10);

  const { error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      password_hash,
      name,
      role,
      dob: dob || null,
      address: address || null,
      subscription: subscription || null
    })
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Send beautiful welcome email
  try {
    const template = welcomeEmailTemplate({
      name: name || "New User",
      email: email,
      loginUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`
    });
    
    await sendMail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
    // Don't fail registration if email fails
  }

  return NextResponse.json({ 
    ok: true, 
    message: "Account created successfully! Welcome to Optima AI 🎉" 
  }, { status: 201 });
}