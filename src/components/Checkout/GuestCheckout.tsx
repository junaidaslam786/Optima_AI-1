"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { getGuestCart, clearGuestCart } from "@/lib/guestCart";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface CheckoutFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Shipping Address
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Billing (if different)
  billingDifferent: boolean;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
}

interface CartItem {
  partner_product_id: string;
  quantity: number;
  added_at?: string;
}

export interface OrderData {
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
  items: CartItem[];
  isGuestOrder: boolean;
  guestId?: string | null;
}

interface GuestCheckoutProps {
  onComplete: (orderData: OrderData) => void;
}

const GuestCheckout: React.FC<GuestCheckoutProps> = ({ onComplete }) => {
  const { data: session } = useSession();
  const { getCartData } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "UK",
    billingDifferent: false,
  });

  const cartData = getCartData();
  const isGuestUser = !session?.user;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateRandomPassword = (): string => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const createGuestAccount = async (orderData: OrderData) => {
    if (!isGuestUser) return null;

    try {
      const randomPassword = generateRandomPassword();
      
      // Create user account
      const accountResponse = await fetch('/api/auth/create-guest-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          temporaryPassword: randomPassword,
          orderData: orderData,
        }),
      });

      if (!accountResponse.ok) {
        throw new Error('Failed to create account');
      }

      const { user, emailSent } = await accountResponse.json();
      
      if (emailSent) {
        toast.success(
          `Account created! Check your email (${formData.email}) for login instructions.`,
          { duration: 6000 }
        );
      }

      return user;
    } catch (error) {
      console.error('Failed to create guest account:', error);
      toast.error('Account creation failed, but your order will still be processed.');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare order data
      const orderData = {
        // Customer Information
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        
        // Shipping Address
        shippingAddress: {
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        
        // Billing Address
        billingAddress: formData.billingDifferent ? {
          address1: formData.billingAddress1 || "",
          address2: formData.billingAddress2,
          city: formData.billingCity || "",
          postalCode: formData.billingPostalCode || "",
          country: formData.billingCountry || "UK",
        } : {
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        
        // Cart Items
        items: isGuestUser ? getGuestCart().items : cartData.items,
        
        // Guest Information
        isGuestOrder: isGuestUser,
        guestId: isGuestUser ? cartData.guestId : null,
      };

      // Create account if it's a guest user (always for guests)
      if (isGuestUser) {
        await createGuestAccount(orderData);
      }

      // Process the order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();
      
      // Clear guest cart after successful order
      if (isGuestUser) {
        clearGuestCart();
      }
      
      toast.success('Order created successfully!');
      onComplete(order);
      
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isGuestUser ? 'Guest Checkout' : 'Checkout'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
          
          <input
            type="text"
            name="address1"
            placeholder="Address Line 1"
            value={formData.address1}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            name="address2"
            placeholder="Address Line 2 (Optional)"
            value={formData.address2}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
          </select>
        </div>

        {/* Account Information for Guests */}
        {isGuestUser && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Account Creation</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Account will be created automatically
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We&apos;ll create an account for you using the email address provided above. 
                    Login credentials will be sent to your email after order completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[rgb(79,135,162)] hover:bg-[rgb(69,125,152)] text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Complete Order'}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Your payment information will be processed securely.</p>
        {isGuestUser && (
          <p className="mt-2 text-blue-600">
            An account will be created automatically with your order.
          </p>
        )}
      </div>
    </div>
  );
};

export default GuestCheckout;
