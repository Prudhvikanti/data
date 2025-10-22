// Netlify Serverless Function: Cashfree Payment Webhook
// This function handles webhook notifications from Cashfree

const crypto = require('crypto');

exports.handler = async (event, context) => {
  try {
    console.log('Payment webhook received:', JSON.stringify(event.body, null, 2));
    
    // Parse webhook data
    const webhookData = JSON.parse(event.body);
    
    // Verify webhook signature (optional but recommended for security)
    const signature = event.headers['x-webhook-signature'] || event.headers['X-Webhook-Signature'];
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;
    
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(webhookData))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
    }
    
    // Process webhook data
    const {
      order_id,
      cf_order_id,
      cf_payment_id,
      payment_status,
      payment_amount,
      payment_currency,
      payment_time,
      customer_details
    } = webhookData;
    
    console.log('Processing webhook for order:', order_id);
    console.log('Payment status:', payment_status);
    console.log('Payment amount:', payment_amount);
    
    // Update your database with payment status
    // This is where you would update your order status in Supabase
    if (payment_status === 'SUCCESS') {
      console.log('✅ Payment successful for order:', order_id);
      
      // Here you would typically:
      // 1. Update order status in your database
      // 2. Send confirmation email to customer
      // 3. Update inventory
      // 4. Trigger any other business logic
      
      // Example: Update Supabase order status
      // await updateOrderStatus(order_id, 'confirmed', cf_payment_id);
      
    } else if (payment_status === 'FAILED') {
      console.log('❌ Payment failed for order:', order_id);
      
      // Handle failed payment
      // 1. Update order status to failed
      // 2. Send failure notification
      // 3. Restore inventory if needed
      
    } else if (payment_status === 'PENDING') {
      console.log('⏳ Payment pending for order:', order_id);
      
      // Handle pending payment
      // 1. Update order status to pending
      // 2. Send pending notification
    }
    
    // Log webhook processing
    console.log('Webhook processed successfully for order:', order_id);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        order_id: order_id,
        payment_status: payment_status
      })
    };
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};
