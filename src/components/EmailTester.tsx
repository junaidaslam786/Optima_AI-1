'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface EmailTest {
  name: string;
  description: string;
  endpoint: string;
  data: Record<string, unknown>;
}

const emailTests: EmailTest[] = [
  {
    name: '🎉 Welcome Email',
    description: 'Beautiful welcome email for new user registration',
    endpoint: '/api/emails/welcome',
    data: {
      name: 'Test User'
    }
  },
  {
    name: '🔐 Password Reset Email',
    description: 'Secure and elegant password reset email',
    endpoint: '/api/auth/forgot-password',
    data: {}
  },
  {
    name: '✉️ Email Verification',
    description: 'Professional email verification template',
    endpoint: '/api/emails/verify-email',
    data: {
      name: 'Test User',
      verificationLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify?token=verify123`
    }
  },
  {
    name: '💳 Payment Success Email',
    description: 'Celebratory payment confirmation email',
    endpoint: '/api/emails/payment-success',
    data: {
      name: 'Test User',
      amount: 99.99,
      currency: 'USD',
      transactionId: 'pi_test_1234567890',
      planName: 'Optima AI Pro Plan',
      planDuration: '1 Month'
    }
  },
  {
    name: '📦 Order Confirmation Email',
    description: 'Detailed order confirmation with tracking',
    endpoint: '/api/emails/order-confirmation',
    data: {
      name: 'Test User',
      orderNumber: 'ORD-2025-001',
      orderDate: new Date(),
      items: [
        { name: 'Optima AI Pro Subscription', quantity: 1, price: 99.99 },
        { name: 'Advanced Analytics Package', quantity: 1, price: 49.99 }
      ],
      subtotal: 149.98,
      tax: 12.00,
      shipping: 0,
      total: 161.98,
      currency: 'USD',
      shippingAddress: '123 Innovation Drive, Tech Valley, CA 94102, United States'
    }
  },
  {
    name: '🧪 Basic Test Email',
    description: 'Simple test email to verify email functionality',
    endpoint: '/api/emails/test',
    data: {}
  }
];

export default function EmailTester() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [testing, setTesting] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const userEmail = session?.user?.email || customEmail || 'taizaab.c11@gmail.com';

  const testSingleEmail = async (test: EmailTest) => {
    try {
      const response = await fetch(test.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          email: userEmail,
          ...test.data
        })
      });

      const result = await response.json();
      
      if (response.ok || result.ok) {
        setResults(prev => ({
          ...prev,
          [test.name]: { success: true, message: result.message || 'Email sent successfully!' }
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [test.name]: { success: false, message: result.error || 'Unknown error' }
        }));
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [test.name]: { success: false, message: error instanceof Error ? error.message : 'Network error' }
      }));
    }
  };

  const testAllEmails = async () => {
    if (!userEmail) {
      alert('Please log in or enter an email address to test');
      return;
    }

    setTesting(true);
    setResults({});

    for (const test of emailTests) {
      await testSingleEmail(test);
      // Wait 1 second between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTesting(false);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🚀 Optima AI Email Testing Suite</h1>
        <p className="text-blue-100">Test all beautiful email templates with dynamic user data</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border">
        <h2 className="text-xl font-semibold mb-4">📧 Email Configuration</h2>
        
        {session?.user ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="text-green-800 dark:text-green-200">
              ✅ <strong>Logged in as:</strong> {session.user.name || 'User'} ({session.user.email})
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Emails will be sent to your account email address
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Not logged in. Please enter an email address for testing:
            </p>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong>Target Email:</strong> {userEmail}
        </div>

        <button
          onClick={testAllEmails}
          disabled={testing || !userEmail}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {testing ? '🔄 Testing All Emails...' : '🚀 Test All Email Templates'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emailTests.map((test) => {
          const result = results[test.name];
          return (
            <div key={test.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{test.name}</h3>
                {result && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    result.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {result.success ? '✅ Sent' : '❌ Failed'}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{test.description}</p>
              
              <button
                onClick={() => testSingleEmail(test)}
                disabled={testing || !userEmail}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Test This Email
              </button>

              {result && (
                <div className={`mt-2 p-2 rounded text-xs ${
                  result.success 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {result.message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🔍 What to look for in emails:</h3>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• 🎨 Beautiful gradients and modern design</li>
          <li>• 📱 Mobile-responsive layout</li>
          <li>• 🔗 Interactive buttons and links</li>
          <li>• 🏢 Consistent Optima AI branding</li>
          <li>• 📋 Clear, actionable content</li>
          <li>• 🛡️ Security and trust indicators</li>
        </ul>
      </div>
    </div>
  );
}
