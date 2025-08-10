import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sendMail, welcomeEmailTemplate, passwordResetEmailTemplate, emailVerificationTemplate, paymentSuccessEmailTemplate, orderConfirmationEmailTemplate } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const { templateType, customEmail, ...templateData } = await req.json();
    
    // Use session email or custom email
    const targetEmail = session?.user?.email || customEmail;
    const userName = session?.user?.name || templateData.name || 'User';
    const origin = req.headers.get("origin") || req.headers.get("host") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    
    if (!targetEmail) {
      return NextResponse.json({ error: "No email address available. Please log in or provide an email." }, { status: 400 });
    }

    let template;
    
    switch (templateType) {
      case 'welcome':
        template = welcomeEmailTemplate({
          name: userName,
          email: targetEmail,
          baseUrl: origin
        });
        break;
        
      case 'password-reset':
        template = passwordResetEmailTemplate({
          name: userName,
          resetLink: `${origin}/auth/reset-password?token=test123`,
          expiresInMinutes: 60
        });
        break;
        
      case 'email-verification':
        template = emailVerificationTemplate({
          name: userName,
          verificationLink: `${origin}/auth/verify?token=verify123`,
          expiresInHours: 24
        });
        break;
        
      case 'payment-success':
        template = paymentSuccessEmailTemplate({
          name: userName,
          amount: templateData.amount || 99.99,
          currency: templateData.currency || 'USD',
          transactionId: templateData.transactionId || 'tx_test123',
          baseUrl: origin
        });
        break;
        
      case 'order-confirmation':
        template = orderConfirmationEmailTemplate({
          name: userName,
          orderNumber: templateData.orderNumber || 'ORD-2025-001',
          orderDate: new Date(),
          items: templateData.items || [
            { name: 'Optima AI Pro', quantity: 1, price: 99.99 }
          ],
          subtotal: templateData.subtotal || 99.99,
          total: templateData.total || 99.99,
          currency: templateData.currency || 'USD',
          shippingAddress: templateData.shippingAddress || '123 Test St, Test City, TC 12345, USA',
          baseUrl: origin
        });
        break;
        
      default:
        return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
    }
    
    await sendMail({
      to: targetEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    
    return NextResponse.json({ 
      ok: true, 
      message: `${templateType} email sent successfully to ${targetEmail}`,
      targetEmail,
      userName 
    });
    
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email";
    console.error("dynamic email error", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
