import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface OrderItem {
  partner_product_id: string;
  quantity: number;
  added_at?: string;
}

interface CreateOrderRequest {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  isGuestOrder: boolean;
  guestId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body: CreateOrderRequest = await request.json();
    
    const {
      customer,
      shippingAddress,
      billingAddress,
      items,
      isGuestOrder,
      guestId
    } = body;

    // Validate required fields
    if (!customer.firstName || !customer.lastName || !customer.email || !items.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;
    let userId = session?.user?.id;

    // For guest orders, try to find or create a user
    if (isGuestOrder) {
      // Check if user already exists with this email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // For guest orders, always create a minimal user record
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone: customer.phone,
            email_verified: false,
            newsletter_subscribed: false, // Default to false
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (userError) {
          console.error('Error creating user:', userError);
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          );
        }

        userId = newUser.id;
      }
    }

    // Calculate order total (you might want to fetch actual product prices)
    let orderTotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Fetch product details to get the price
      const { data: product } = await supabase
        .from('partner_products')
        .select('price, title')
        .eq('id', item.partner_product_id)
        .single();

      if (product) {
        const itemTotal = parseFloat(product.price) * item.quantity;
        orderTotal += itemTotal;
        
        orderItems.push({
          partner_product_id: item.partner_product_id,
          quantity: item.quantity,
          price: product.price,
          title: product.title,
          total: itemTotal,
        });
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        guest_id: isGuestOrder ? guestId : null,
        status: 'pending',
        total: orderTotal,
        currency: 'GBP',
        customer_info: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        },
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        is_guest_order: isGuestOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    for (const item of orderItems) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          partner_product_id: item.partner_product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          created_at: new Date().toISOString(),
        });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        // Continue with other items even if one fails
      }
    }

    // Clear guest cart if it's a guest order
    // This would be handled on the client side

    // Send order confirmation email
    try {
      const emailResponse = await fetch('/api/emails/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customer.email,
          firstName: customer.firstName,
          order,
          orderItems,
        }),
      });

      if (!emailResponse.ok) {
        console.warn('Failed to send order confirmation email');
      }
    } catch (emailError) {
      console.warn('Email service error:', emailError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        currency: order.currency,
        created_at: order.created_at,
      },
      orderItems,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
