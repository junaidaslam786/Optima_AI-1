import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreateGuestAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateGuestAccountRequest = await request.json();
    const { firstName, lastName, email, password, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        phone,
        password_hash: hashedPassword,
        email_verified: false,
        newsletter_subscribed: false, // Default to false since we don't collect newsletter preference
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Send welcome email with login credentials
    try {
      const emailResponse = await fetch('/api/emails/welcome-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          password, // Send the plain password in the welcome email
        }),
      });

      if (!emailResponse.ok) {
        console.warn('Failed to send welcome email, but account was created');
      }
    } catch (emailError) {
      console.warn('Email service error:', emailError);
      // Don't fail the account creation if email fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });

  } catch (error) {
    console.error('Create guest account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
