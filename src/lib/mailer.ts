import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { google } from "googleapis";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;
const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !SENDER_EMAIL) {
  console.warn(
    "[mailer] Missing Gmail OAuth2 env vars. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_EMAIL"
  );
}

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

if (REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
}

// Base email styles for consistent branding
const emailStyles = `
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .email-body {
      background: white;
      padding: 40px 30px;
      color: #333;
      line-height: 1.6;
    }
    .greeting {
      font-size: 24px;
      color: #667eea;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .content {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      text-align: center;
      margin: 20px 0;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
    }
    .info-box {
      background: linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%);
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 10px;
    }
    .email-footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #eee;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      padding: 10px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      text-decoration: none;
      width: 40px;
      height: 40px;
      line-height: 20px;
    }
    .highlight {
      background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .order-details {
      background: white;
      border: 2px solid #667eea;
      border-radius: 15px;
      padding: 25px;
      margin: 25px 0;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .total-amount {
      font-size: 20px;
      font-weight: bold;
      color: #667eea;
      padding-top: 15px;
      border-top: 2px solid #667eea;
    }
  </style>
`;

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !SENDER_EMAIL) {
    throw new Error("Gmail OAuth2 configuration missing");
  }

  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: (typeof accessToken === "string" ? accessToken : (accessToken as { token?: string })?.token) as string,
    },
  } as SMTPTransport.Options);

  await transporter.sendMail({
    from: `Optima AI <${SENDER_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

// Welcome Email Template for New Registrations
export function welcomeEmailTemplate(params: {
  name: string;
  email: string;
  loginUrl?: string;
  baseUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = "🎉 Welcome to Optima AI - Your AI Journey Begins!";
  const loginUrl = params.loginUrl || `${params.baseUrl || BASE_URL}/signin`;
  
  const text = `Welcome to Optima AI, ${params.name}!\n\nWe're thrilled to have you join our community of AI enthusiasts. Your account (${params.email}) has been successfully created.\n\nGet started: ${loginUrl}\n\nBest regards,\nThe Optima AI Team`;
  
  const html = `
    ${emailStyles}
    <div class="email-container">
      <div class="email-header">
        <div class="logo">🤖 Optima AI</div>
        <h1 style="margin: 0; font-size: 28px;">Welcome Aboard!</h1>
      </div>
      <div class="email-body">
        <div class="greeting">Hello ${params.name}! 👋</div>
        <div class="content">
          <p>🎉 <strong>Congratulations!</strong> You've successfully joined the <span class="highlight">Optima AI</span> family. We're absolutely thrilled to have you on board!</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">🚀 What's Next?</h3>
            <ul style="padding-left: 20px;">
              <li>✨ Explore our AI-powered features</li>
              <li>🔬 Discover advanced analytics</li>
              <li>📊 Generate insightful reports</li>
              <li>🤝 Connect with our community</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${loginUrl}" class="cta-button">🎯 Start Your AI Journey</a>
          </p>
          
          <p>Your account <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px;">${params.email}</code> is ready to go!</p>
        </div>
      </div>
      <div class="email-footer">
        <div class="social-links">
          <a href="#" title="Twitter">🐦</a>
          <a href="#" title="LinkedIn">💼</a>
          <a href="#" title="Facebook">📘</a>
        </div>
        <p>Thank you for choosing Optima AI<br>
        Need help? Contact us at <a href="mailto:support@optima-ai.com">support@optima-ai.com</a></p>
      </div>
    </div>
  `;
  
  return { subject, html, text };
}

// Password Reset Email Template
export function passwordResetEmailTemplate(params: {
  name?: string | null;
  resetLink: string;
  expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
  const subject = "🔐 Reset Your Optima AI Password";
  const greeting = params.name ? `Hi ${params.name}` : "Hello";
  
  const text = `${greeting},\n\nWe received a request to reset your Optima AI password.\n\nReset your password: ${params.resetLink}\n\nThis link expires in ${params.expiresInMinutes} minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nOptima AI Security Team`;
  
  const html = `
    ${emailStyles}
    <div class="email-container">
      <div class="email-header">
        <div class="logo">🔐 Optima AI</div>
        <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
      </div>
      <div class="email-body">
        <div class="greeting">${greeting}! 👋</div>
        <div class="content">
          <p>We received a request to reset your <span class="highlight">Optima AI</span> password. Don't worry, we've got you covered! 🛡️</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">🔑 Security Notice</h3>
            <p><strong>Action required within ${params.expiresInMinutes} minutes</strong></p>
            <p>For your security, this reset link will expire soon.</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${params.resetLink}" class="cta-button">🔓 Reset My Password</a>
          </p>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
            <code style="background: #f4f4f4; padding: 8px; border-radius: 4px; word-break: break-all; display: block; margin-top: 5px;">${params.resetLink}</code>
          </p>
          
          <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            ⚠️ If you didn't request this password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
      </div>
      <div class="email-footer">
        <p>🔒 This is an automated security message from Optima AI<br>
        Need help? Contact us at <a href="mailto:security@optima-ai.com">security@optima-ai.com</a></p>
      </div>
    </div>
  `;
  
  return { subject, html, text };
}

// Password Changed Confirmation Email
export function passwordChangedEmailTemplate(params: {
  name?: string | null;
  email: string;
  resetLink: string;
  timestamp?: Date;
}): { subject: string; html: string; text: string } {
  const subject = "✅ Your Optima AI Password Was Changed";
  const greeting = params.name ? `Hi ${params.name}` : "Hello";
  const timestamp = params.timestamp || new Date();
  
  const text = `${greeting},\n\nYour Optima AI password was successfully changed on ${timestamp.toLocaleString()}.\n\nIf you didn't make this change, reset your password immediately: ${params.resetLink}\n\nBest regards,\nOptima AI Security Team`;
  
  const html = `
    ${emailStyles}
    <div class="email-container">
      <div class="email-header">
        <div class="logo">✅ Optima AI</div>
        <h1 style="margin: 0; font-size: 28px;">Password Updated</h1>
      </div>
      <div class="email-body">
        <div class="greeting">${greeting}! 👋</div>
        <div class="content">
          <p>Great news! Your <span class="highlight">Optima AI</span> password has been successfully updated. 🎉</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #28a745;">✅ Change Confirmed</h3>
            <p><strong>Account:</strong> ${params.email}</p>
            <p><strong>Changed on:</strong> ${timestamp.toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Secure</span></p>
          </div>
          
          <p>Your account is now protected with your new password. Make sure to keep it safe! 🔐</p>
          
          <div style="background: #d1ecf1; border-left: 4px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>🚨 Didn't make this change?</strong></p>
            <p style="margin: 10px 0 0 0;">If you didn't change your password, someone else might have access to your account.</p>
            <p style="text-align: center; margin-top: 15px;">
              <a href="${params.resetLink}" class="cta-button" style="background: #dc3545;">🔒 Secure My Account</a>
            </p>
          </div>
        </div>
      </div>
      <div class="email-footer">
        <p>🔒 This is an automated security notification from Optima AI<br>
        Questions? Contact us at <a href="mailto:security@optima-ai.com">security@optima-ai.com</a></p>
      </div>
    </div>
  `;
  
  return { subject, html, text };
}

// Payment Successful Email Template
export function paymentSuccessEmailTemplate(params: {
  name: string;
  amount: number;
  currency: string;
  transactionId: string;
  planName?: string;
  planDuration?: string;
  nextBillingDate?: Date;
  baseUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = "💳 Payment Successful - Optima AI";
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: params.currency || 'USD'
  }).format(params.amount);
  
  const text = `Hi ${params.name},\n\nYour payment of ${formattedAmount} has been processed successfully!\n\nTransaction ID: ${params.transactionId}\n${params.planName ? `Plan: ${params.planName}` : ''}\n\nThank you for choosing Optima AI!\n\nBest regards,\nOptima AI Team`;
  
  const html = `
    ${emailStyles}
    <div class="email-container">
      <div class="email-header">
        <div class="logo">💳 Optima AI</div>
        <h1 style="margin: 0; font-size: 28px;">Payment Successful!</h1>
      </div>
      <div class="email-body">
        <div class="greeting">Hi ${params.name}! 🎉</div>
        <div class="content">
          <p>Excellent! Your payment has been processed successfully. Thank you for continuing your journey with <span class="highlight">Optima AI</span>! 🚀</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #667eea; text-align: center;">📋 Payment Details</h3>
            <div class="order-item">
              <span><strong>💰 Amount:</strong></span>
              <span style="color: #28a745; font-weight: bold;">${formattedAmount}</span>
            </div>
            <div class="order-item">
              <span><strong>🔢 Transaction ID:</strong></span>
              <span><code>${params.transactionId}</code></span>
            </div>
            ${params.planName ? `
            <div class="order-item">
              <span><strong>📦 Plan:</strong></span>
              <span>${params.planName}</span>
            </div>
            ` : ''}
            ${params.planDuration ? `
            <div class="order-item">
              <span><strong>⏱️ Duration:</strong></span>
              <span>${params.planDuration}</span>
            </div>
            ` : ''}
            ${params.nextBillingDate ? `
            <div class="order-item">
              <span><strong>📅 Next Billing:</strong></span>
              <span>${params.nextBillingDate.toLocaleDateString()}</span>
            </div>
            ` : ''}
            <div class="total-amount">
              <div style="text-align: center;">
                ✅ Payment Status: <span style="color: #28a745;">CONFIRMED</span>
              </div>
            </div>
          </div>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">🎁 What's Included</h3>
            <ul style="padding-left: 20px;">
              <li>✨ Full access to AI features</li>
              <li>📊 Advanced analytics dashboard</li>
              <li>🔧 Premium support</li>
              <li>📈 Enhanced reporting tools</li>
            </ul>
          </div>
          
          <p style="text-align: center;">
            <a href="${params.baseUrl || BASE_URL}/dashboard" class="cta-button">🚀 Access Your Dashboard</a>
          </p>
        </div>
      </div>
      <div class="email-footer">
        <p>💳 Keep this email as your receipt<br>
        Questions about billing? Contact us at <a href="mailto:billing@optima-ai.com">billing@optima-ai.com</a></p>
      </div>
    </div>
  `;
  
  return { subject, html, text };
}

// Order Confirmation Email Template
export function orderConfirmationEmailTemplate(params: {
  name: string;
  orderNumber: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  currency: string;
  baseUrl?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery?: Date;
}): { subject: string; html: string; text: string } {
  const subject = `📦 Order Confirmation #${params.orderNumber} - Optima AI`;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: params.currency || 'USD'
  }).format(amount);
  
  const text = `Hi ${params.name},\n\nThank you for your order! Here are the details:\n\nOrder #${params.orderNumber}\nDate: ${params.orderDate.toLocaleDateString()}\nTotal: ${formatCurrency(params.total)}\n\n${params.estimatedDelivery ? `Estimated Delivery: ${params.estimatedDelivery.toLocaleDateString()}` : ''}\n\nWe'll send you updates as your order progresses.\n\nBest regards,\nOptima AI Team`;
  
  const html = `
    ${emailStyles}
    <div class="email-container">
      <div class="email-header">
        <div class="logo">📦 Optima AI</div>
        <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
      </div>
      <div class="email-body">
        <div class="greeting">Hi ${params.name}! 🎉</div>
        <div class="content">
          <p>Thank you for your order! We're excited to get your <span class="highlight">Optima AI</span> products to you. 🚀</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #667eea; text-align: center;">📋 Order Summary</h3>
            <div class="order-item">
              <span><strong>📝 Order Number:</strong></span>
              <span><code>#${params.orderNumber}</code></span>
            </div>
            <div class="order-item">
              <span><strong>📅 Order Date:</strong></span>
              <span>${params.orderDate.toLocaleDateString()}</span>
            </div>
            ${params.estimatedDelivery ? `
            <div class="order-item">
              <span><strong>🚚 Estimated Delivery:</strong></span>
              <span style="color: #28a745; font-weight: bold;">${params.estimatedDelivery.toLocaleDateString()}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #667eea;">🛍️ Items Ordered</h3>
            ${params.items.map(item => `
              <div class="order-item">
                <span><strong>${item.name}</strong> (x${item.quantity})</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
              <div class="order-item">
                <span>Subtotal:</span>
                <span>${formatCurrency(params.subtotal)}</span>
              </div>
              ${params.tax ? `
              <div class="order-item">
                <span>Tax:</span>
                <span>${formatCurrency(params.tax)}</span>
              </div>
              ` : ''}
              ${params.shipping ? `
              <div class="order-item">
                <span>Shipping:</span>
                <span>${formatCurrency(params.shipping)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="total-amount">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Total:</span>
                <span>${formatCurrency(params.total)}</span>
              </div>
            </div>
          </div>
          
          ${params.shippingAddress ? `
          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">🏠 Shipping Address</h3>
            <address style="font-style: normal; line-height: 1.5;">
              ${params.shippingAddress.street}<br>
              ${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.zipCode}<br>
              ${params.shippingAddress.country}
            </address>
          </div>
          ` : ''}
          
          <p style="text-align: center;">
            <a href="${params.baseUrl || BASE_URL}/orders/${params.orderNumber}" class="cta-button">📦 Track Your Order</a>
          </p>
          
          <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ What's Next?</strong></p>
            <ul style="margin: 10px 0 0 20px;">
              <li>📧 You'll receive shipping updates via email</li>
              <li>📱 Track your package with the link above</li>
              <li>🎁 Enjoy your Optima AI products!</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="email-footer">
        <p>📦 Keep this email for your records<br>
        Questions about your order? Contact us at <a href="mailto:orders@optima-ai.com">orders@optima-ai.com</a></p>
      </div>
    </div>
  `;
  
  return { subject, html, text };
}

// Account Verification Email Template
export function emailVerificationTemplate(params: {
  name: string;
  verificationLink: string;
  expiresInHours: number;
}): { subject: string; html: string; text: string } {
  const subject = "✉️ Verify Your Optima AI Email Address";
  
  const text = `Hi ${params.name},\n\nPlease verify your email address to complete your Optima AI registration.\n\nVerify now: ${params.verificationLink}\n\nThis link expires in ${params.expiresInHours} hours.\n\nBest regards,\nOptima AI Team`;
  
  const html = `
    ${emailStyles}
    <div class="email-container">
      <div class="email-header">
        <div class="logo">✉️ Optima AI</div>
        <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
      </div>
      <div class="email-body">
        <div class="greeting">Hi ${params.name}! 👋</div>
        <div class="content">
          <p>You're almost ready to start your <span class="highlight">Optima AI</span> journey! Just one more step to go. 🚀</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">📧 Email Verification Required</h3>
            <p>To ensure your account security and enable all features, please verify your email address.</p>
            <p><strong>⏰ This link expires in ${params.expiresInHours} hours</strong></p>
          </div>
          
          <p style="text-align: center;">
            <a href="${params.verificationLink}" class="cta-button">✅ Verify My Email</a>
          </p>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
            <code style="background: #f4f4f4; padding: 8px; border-radius: 4px; word-break: break-all; display: block; margin-top: 5px;">${params.verificationLink}</code>
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Important:</strong> Until verified, some features may be limited.</p>
          </div>
        </div>
      </div>
      <div class="email-footer">
        <p>🔒 This verification link is unique to your account<br>
        Need help? Contact us at <a href="mailto:support@optima-ai.com">support@optima-ai.com</a></p>
      </div>
    </div>
  `;
  
  return { subject, html, text };
}
