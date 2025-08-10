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
  paymentIntentId?: string;
  totalAmount?: number;
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body: CreateOrderRequest = await request.json();
    
    const {
      customer,
      shippingAddress,
      items,
      isGuestOrder,
      paymentIntentId,
      totalAmount,
      status = 'pending'
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
            phone: customer.phone,
            role: 'client',
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

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Calculate order total and get product details from Supabase
    let orderTotal = totalAmount || 0;
    const orderItems: Array<{
      partner_product_id: string;
      quantity: number;
      price: number;
      title: string;
      total: number;
      partner_id: string;
    }> = [];

    // Group items by partner to handle multiple partners in one order
    const partnerGroups: { [partnerId: string]: typeof orderItems } = {};

    for (const item of items) {
      // Fetch product details including partner info
      const { data: product, error: productError } = await supabase
        .from('partner_products')
        .select(`
          partner_price,
          partner_name,
          partner_id,
          partner_profiles!inner(id, user_id)
        `)
        .eq('id', item.partner_product_id)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        console.error('Product fetch error:', productError);
        return NextResponse.json(
          { error: `Product not found or inactive: ${item.partner_product_id}` },
          { status: 400 }
        );
      }

      const itemTotal = product.partner_price * item.quantity;
      
      // If totalAmount was not provided, calculate it
      if (!totalAmount) {
        orderTotal += itemTotal;
      }

      const orderItem = {
        partner_product_id: item.partner_product_id,
        quantity: item.quantity,
        price: product.partner_price,
        title: product.partner_name || 'Product',
        total: itemTotal,
        partner_id: product.partner_id,
      };

      orderItems.push(orderItem);

      // Group by partner
      if (!partnerGroups[product.partner_id]) {
        partnerGroups[product.partner_id] = [];
      }
      partnerGroups[product.partner_id].push(orderItem);
    }

    // Create transaction record first
    let transactionId: string | null = null;
    
    if (paymentIntentId && status === 'paid') {
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_amount: orderTotal,
          currency: 'GBP',
          payment_gateway: 'Stripe',
          gateway_transaction_id: paymentIntentId,
          transaction_status: 'succeeded',
          transaction_type: 'sale',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return NextResponse.json(
          { error: 'Failed to create transaction record' },
          { status: 500 }
        );
      }

      transactionId = transaction.id;
    }

    // Create orders for each partner (your schema supports one partner per order)
    const createdOrders = [];

    for (const [partnerId, partnerItems] of Object.entries(partnerGroups)) {
      const partnerTotal = partnerItems.reduce((sum, item) => sum + item.total, 0);

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_user_id: userId,
          partner_id: partnerId,
          primary_transaction_id: transactionId,
          total_amount: partnerTotal,
          currency: 'GBP',
          order_status: status === 'paid' ? 'processing' : 'pending',
          payment_status: status === 'paid' ? 'paid' : 'pending',
          order_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 }
        );
      }

      // Update transaction with order_id if we created a transaction
      if (transactionId) {
        await supabase
          .from('transactions')
          .update({ order_id: order.id })
          .eq('id', transactionId);
      }

      // Create order items for this partner
      for (const item of partnerItems) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            partner_product_id: item.partner_product_id,
            quantity: item.quantity,
            price_at_purchase: item.price,
            admin_revenue_share: item.price * 0.1, // 10% admin commission
            partner_revenue_share: item.price * 0.9, // 90% to partner
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (itemError) {
          console.error('Error creating order item:', itemError);
          // Continue with other items even if one fails
        }
      }

      // Create shipping details
      const { error: shippingError } = await supabase
        .from('shipping_details')
        .insert({
          order_id: order.id,
          recipient_name: `${customer.firstName} ${customer.lastName}`,
          address_line1: shippingAddress.address1,
          address_line2: shippingAddress.address2,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone_number: customer.phone,
          shipping_cost: 0.00, // Free shipping for now
          shipping_method: 'Standard Delivery',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (shippingError) {
        console.error('Error creating shipping details:', shippingError);
        // Continue as this is not critical
      }

      createdOrders.push({
        id: order.id,
        partner_id: partnerId,
        total: partnerTotal,
        items: partnerItems,
      });
    }

    // Send order confirmation email
    try {
      const emailResponse = await fetch(`${request.headers.get('origin') || process.env.NEXTAUTH_URL}/api/emails/order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customer.email,
          firstName: customer.firstName,
          orders: createdOrders,
          totalAmount: orderTotal,
          paymentStatus: status,
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
      orders: createdOrders,
      totalAmount: orderTotal,
      paymentStatus: status,
      transactionId,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
