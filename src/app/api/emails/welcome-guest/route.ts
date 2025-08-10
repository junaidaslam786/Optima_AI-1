import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, password }: WelcomeEmailRequest = await request.json();

    if (!email || !firstName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const subject = 'Welcome to Optima AI - Your Account Details';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: rgb(79,135,162);">Welcome to Optima AI, ${firstName}!</h1>
        
        <p>Thank you for shopping with us! We've created an account for you to make future purchases even easier.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Login Details:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        
        <p>Please keep these details safe. You can log in to your account at any time to:</p>
        <ul>
          <li>View your order history</li>
          <li>Track your shipments</li>
          <li>Access your health reports</li>
          <li>Manage your profile</li>
        </ul>
        
        <p>For security reasons, we recommend changing your password after your first login.</p>
        
        <div style="background-color: #4F87A2; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/auth/signin" style="color: white; text-decoration: none; font-weight: bold;">
            Log In to Your Account
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact our support team.<br>
          This email was sent automatically. Please do not reply to this email.
        </p>
      </div>
    `;

    const textContent = `
      Welcome to Optima AI, ${firstName}!
      
      Thank you for shopping with us! We've created an account for you to make future purchases even easier.
      
      Your Login Details:
      Email: ${email}
      Password: ${password}
      
      Please keep these details safe. You can log in to your account at any time to:
      - View your order history
      - Track your shipments
      - Access your health reports
      - Manage your profile
      
      For security reasons, we recommend changing your password after your first login.
      
      Log in at: ${process.env.NEXTAUTH_URL}/auth/signin
      
      If you have any questions, please contact our support team.
    `;

    await sendMail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
