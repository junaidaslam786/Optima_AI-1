import { NextRequest, NextResponse } from "next/server";
import { sendMail, welcomeEmailTemplate } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { to, name, email, loginUrl } = await req.json();
    const origin = req.headers.get("origin") || req.headers.get("host") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    
    if (!to) return NextResponse.json({ error: "Missing 'to'" }, { status: 400 });
    
    const template = welcomeEmailTemplate({
      name: name || "Valued User",
      email: email || to,
      loginUrl,
      baseUrl: origin
    });
    
    await sendMail({ 
      to, 
      subject: template.subject, 
      html: template.html, 
      text: template.text 
    });
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    console.error("welcome email error", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
