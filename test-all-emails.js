// Comprehensive Email Testing Script for Optima AI
// Test script to send all types of beautiful emails from Optima AI
const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'taizaab.c11@gmail.com'; // Fallback email for testing

const emailTests = [
    {
        name: '🎉 Welcome Email',
        description: 'Beautiful welcome email for new user registration',
        endpoint: '/api/emails/welcome',
        data: {
            name: 'Alex Johnson',
            email: TEST_EMAIL
        }
    },
    {
        name: '🔐 Password Reset Email',
        description: 'Secure and elegant password reset email',
        endpoint: '/api/auth/forgot-password',
        data: {
            email: TEST_EMAIL
        }
    },
    {
        name: '✉️ Email Verification',
        description: 'Professional email verification template',
        endpoint: '/api/emails/verify-email',
        data: {
            name: 'Alex Johnson',
            verificationLink: `${BASE_URL}/auth/verify?token=verify123`
        }
    },
    {
        name: '💳 Payment Success Email',
        description: 'Celebratory payment confirmation email',
        endpoint: '/api/emails/payment-success',
        data: {
            name: 'Alex Johnson',
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
            name: 'Alex Johnson',
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

async function testEmail(test, userEmail) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`📝 ${test.description}`);
    console.log(`🌐 Endpoint: ${test.endpoint}`);
    console.log(`📧 Sending to: ${userEmail}`);
    
    try {
        const response = await fetch(`${BASE_URL}${test.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: userEmail,
                ...test.data
            })
        });
        
        const result = await response.json();
        
        if (response.ok || result.ok) {
            console.log(`✅ SUCCESS: ${test.name} sent successfully!`);
            if (result.message) console.log(`💌 Message: ${result.message}`);
        } else {
            console.log(`❌ FAILED: ${test.name}`);
            console.log(`🚨 Error: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`💥 NETWORK ERROR: ${test.name}`);
        console.log(`🔍 Details: ${error.message}`);
    }
    
    console.log('━'.repeat(60));
}

async function runAllTests(userEmail = TEST_EMAIL) {
    console.log('🚀 OPTIMA AI EMAIL TESTING SUITE');
    console.log('🎨 Showcasing Beautiful Email Templates');
    console.log('📧 Target Email Address:', userEmail);
    console.log('🌐 Base URL:', BASE_URL);
    console.log('=' .repeat(60));
    
    for (const test of emailTests) {
        await testEmail(test, userEmail);
        // Wait 2 seconds between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 EMAIL TESTING COMPLETE!');
    console.log(`📬 Please check ${userEmail} inbox for all beautiful emails`);
    console.log('✨ Each email showcases professional design and branding');
    console.log('\n🔍 What to look for in each email:');
    console.log('  • 🎨 Beautiful gradients and modern design');
    console.log('  • 📱 Mobile-responsive layout');
    console.log('  • 🔗 Interactive buttons and links');
    console.log('  • 🏢 Consistent Optima AI branding');
    console.log('  • 📋 Clear, actionable content');
    console.log('  • 🛡️ Security and trust indicators');
}

// Check if email is provided as command line argument
const userEmailArg = process.argv[2];
if (userEmailArg) {
    console.log(`🎯 Using provided email: ${userEmailArg}`);
    runAllTests(userEmailArg).catch(console.error);
} else {
    console.log(`⚠️ No email provided, using default: ${TEST_EMAIL}`);
    console.log(`💡 Usage: node test-all-emails.js your-email@example.com`);
    runAllTests().catch(console.error);
}
