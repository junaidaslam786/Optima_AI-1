import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

interface OrderConfirmationRequest {
  email: string;
  firstName: string;
  order: {
    id: string;
    total: number;
    currency: string;
    created_at: string;
  };
  orderItems: Array<{
    title: string;
    quantity: number;
    price: string;
    total: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, order, orderItems }: OrderConfirmationRequest = await request.json();

    if (!email || !firstName || !order) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const subject = `Order Confirmation #${order.id}`;
    
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">£${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">£${item.total.toFixed(2)}</td>
      </tr>
    `).join('');
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: rgb(79,135,162);">Order Confirmation</h1>
        
        <p>Dear ${firstName},</p>
        
        <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> #${order.id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Total:</strong> £${order.total.toFixed(2)} ${order.currency}</p>
        </div>
        
        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: rgb(79,135,162); color: white;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f9f9f9;">
              <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
              <td style="padding: 10px; text-align: right;">£${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p>We'll send you another email with tracking information once your order ships.</p>
        
        <div style="background-color: #4F87A2; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/orders" style="color: white; text-decoration: none; font-weight: bold;">
            View Your Orders
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #666; font-size: 12px;">
          If you have any questions about your order, please contact our support team.<br>
          This email was sent automatically. Please do not reply to this email.
        </p>
      </div>
    `;

    const itemsText = orderItems.map(item => 
      `${item.title} - Qty: ${item.quantity} - £${item.price} each - Total: £${item.total.toFixed(2)}`
    ).join('\n');

    const textContent = `
      Order Confirmation #${order.id}
      
      Dear ${firstName},
      
      Thank you for your order! We've received your order and are preparing it for shipment.
      
      Order Details:
      Order Number: #${order.id}
      Order Date: ${new Date(order.created_at).toLocaleDateString()}
      Total: £${order.total.toFixed(2)} ${order.currency}
      
      Order Items:
      ${itemsText}
      
      Total: £${order.total.toFixed(2)}
      
      We'll send you another email with tracking information once your order ships.
      
      View your orders at: ${process.env.NEXTAUTH_URL}/orders
      
      If you have any questions about your order, please contact our support team.
    `;

    await sendMail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation email' },
      { status: 500 }
    );
  }
}
