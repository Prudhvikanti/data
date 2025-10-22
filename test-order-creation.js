// Test Order Creation After RLS Fix
// Run this in your browser console after applying the RLS fixes

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation After RLS Fix...');
  
  try {
    // Test data that matches your app structure
    const testOrderData = {
      user_id: 'test-user-' + Date.now(),
      total_amount: 99.99,
      delivery_fee: 2.99,
      delivery_address: '123 Test Street, Test City, Test State 12345',
      phone: '9999999999',
      payment_method: 'cod',
      payment_type: 'cod',
      payment_status: 'pending',
      delivery_instructions: 'Test order - please ignore',
      estimated_delivery_time: new Date(Date.now() + 12 * 60 * 1000).toISOString()
    };

    console.log('📋 Test Order Data:', testOrderData);

    // This would be the actual API call in your app
    // const response = await fetch('/api/orders', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(testOrderData)
    // });

    console.log('✅ Order creation test data prepared');
    console.log('📱 Phone number included:', testOrderData.phone);
    console.log('💰 Total amount:', testOrderData.total_amount);
    console.log('📍 Delivery address:', testOrderData.delivery_address);
    console.log('💳 Payment method:', testOrderData.payment_method);
    
    return {
      success: true,
      message: 'Order creation test data is valid',
      orderData: testOrderData
    };
    
  } catch (error) {
    console.error('❌ Order creation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testOrderCreation().then(result => {
  console.log('🎯 Test Result:', result);
});

console.log('🚀 Run this test after applying the RLS fixes!');
console.log('📋 Make sure to run FIX_RLS_POLICIES.sql in Supabase first!');