import Cookies from 'js-cookie';

// Guest checkout utilities for managing guest order data
export interface GuestCheckoutData {
  email: string;
  name: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

// Cookie configuration for guest checkout data
const GUEST_CHECKOUT_COOKIE_NAME = 'guest_checkout';
const CHECKOUT_COOKIE_OPTIONS = {
  expires: 1, // 1 day
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

// Save guest checkout data to cookies
export const saveGuestCheckoutData = (data: Partial<GuestCheckoutData>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existingData = getGuestCheckoutData();
    const updatedData = {
      ...existingData,
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    if (!updatedData.created_at) {
      updatedData.created_at = new Date().toISOString();
    }
    
    Cookies.set(GUEST_CHECKOUT_COOKIE_NAME, JSON.stringify(updatedData), CHECKOUT_COOKIE_OPTIONS);
  } catch (error) {
    console.error('Error saving guest checkout data:', error);
  }
};

// Get guest checkout data from cookies
export const getGuestCheckoutData = (): Partial<GuestCheckoutData> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const data = Cookies.get(GUEST_CHECKOUT_COOKIE_NAME);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting guest checkout data:', error);
    // Clear corrupted cookie
    Cookies.remove(GUEST_CHECKOUT_COOKIE_NAME);
  }
  
  return {};
};

// Clear guest checkout data
export const clearGuestCheckoutData = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(GUEST_CHECKOUT_COOKIE_NAME);
};

// Check if guest has complete checkout data
export const hasCompleteGuestCheckoutData = (): boolean => {
  const data = getGuestCheckoutData();
  return !!(
    data.email &&
    data.name &&
    data.address?.line1 &&
    data.address?.city &&
    data.address?.postal_code &&
    data.address?.country
  );
};

// Pre-fill guest checkout data for quick checkout
export const getGuestCheckoutForm = () => {
  const data = getGuestCheckoutData();
  return {
    email: data.email || '',
    name: data.name || '',
    phone: data.phone || '',
    address_line_1: data.address?.line1 || '',
    address_line_2: data.address?.line2 || '',
    city: data.address?.city || '',
    state: data.address?.state || '',
    postal_code: data.address?.postal_code || '',
    country: data.address?.country || 'GB',
  };
};

// Update guest checkout form data
export const updateGuestCheckoutForm = (formData: {
  email: string;
  name: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}): void => {
  const checkoutData: Partial<GuestCheckoutData> = {
    email: formData.email,
    name: formData.name,
    phone: formData.phone,
    address: {
      line1: formData.address_line_1,
      line2: formData.address_line_2,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_code,
      country: formData.country,
    },
  };
  
  saveGuestCheckoutData(checkoutData);
};
