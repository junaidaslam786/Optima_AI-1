// Test the new dynamic email API endpoint
const testDynamicEmail = async () => {
  try {
    // Test welcome email with custom email
    const response = await fetch('http://localhost:3000/api/emails/send-to-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateType: 'welcome',
        customEmail: 'taizaab.c11@gmail.com',
        name: 'Test User from Dynamic API'
      })
    });
    
    const result = await response.json();
    console.log('✅ Dynamic Welcome Email Result:', result);
    
    // Test payment success email
    const paymentResponse = await fetch('http://localhost:3000/api/emails/send-to-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateType: 'payment-success',
        customEmail: 'taizaab.c11@gmail.com',
        name: 'Test User',
        amount: 149.99,
        currency: 'USD',
        transactionId: 'tx_dynamic_test_123'
      })
    });
    
    const paymentResult = await paymentResponse.json();
    console.log('✅ Dynamic Payment Email Result:', paymentResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

console.log('🚀 Testing Dynamic Email API...');
testDynamicEmail();
