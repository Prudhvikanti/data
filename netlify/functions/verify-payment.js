// Netlify Serverless Function: Verify Cashfree Payment Status
// This function verifies payment status with Cashfree

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { orderId } = JSON.parse(event.body);
    
    console.log('Verifying payment for order:', orderId);
    
    // Get Cashfree credentials from environment variables
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE || 'sandbox';
    
    if (!appId || !secretKey) {
      throw new Error('Cashfree credentials not configured');
    }
    
    // Cashfree API endpoint for order status
    const apiUrl = mode === 'production'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;
    
    console.log('Calling Cashfree API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      throw new Error(data.message || 'Failed to verify payment');
    }
    
    console.log('✓ Payment verification successful');
    console.log('Payment Status:', data.payment_status);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data,
        payment_status: data.payment_status,
        order_status: data.order_status
      })
    };
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
