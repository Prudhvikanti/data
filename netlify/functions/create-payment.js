// Netlify Serverless Function: Create Cashfree Payment Session
// This function handles payment session creation for Cashfree payments

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
    const { orderData } = JSON.parse(event.body);
    
    console.log('Creating Cashfree payment session...');
    console.log('Order Amount:', orderData.amount);
    
    // Get Cashfree credentials from environment variables
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE || 'sandbox';
    
    if (!appId || !secretKey) {
      throw new Error('Cashfree credentials not configured');
    }
    
    // Cashfree API endpoint - Use orders endpoint for payment sessions
    const apiUrl = mode === 'production'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';
    
    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payload = {
      order_id: orderId,
      order_amount: parseFloat(orderData.amount).toFixed(2),
      order_currency: 'INR',
      customer_details: {
        customer_id: orderData.customerId || `CUST_${Date.now()}`,
        customer_email: orderData.customerEmail || 'customer@example.com',
        customer_phone: orderData.customerPhone || '9999999999',
        customer_name: orderData.customerName || 'Customer'
      },
      order_meta: {
        return_url: orderData.returnUrl || `${process.env.URL}/payment-success`,
        notify_url: `${process.env.URL}/.netlify/functions/payment-webhook`
      }
    };
    
    console.log('Calling Cashfree API:', apiUrl);
    console.log('Order ID:', orderId);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    console.log('Cashfree API Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      throw new Error(data.message || data.error || 'Failed to create payment session');
    }
    
    console.log('✓ Payment session created successfully');
    console.log('Session ID:', data.payment_session_id);
    
    // Ensure we have a valid payment_session_id
    if (!data.payment_session_id) {
      throw new Error('Payment session ID not received from Cashfree');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          payment_session_id: data.payment_session_id,
          order_id: data.order_id || orderId,
          order_amount: data.order_amount,
          order_currency: data.order_currency
        },
        order_id: orderId
      })
    };
    
  } catch (error) {
    console.error('Payment creation error:', error);
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
