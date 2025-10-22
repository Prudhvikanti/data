import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const app = express()
const PORT = 3002

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Payment API Server Running',
    timestamp: new Date().toISOString()
  })
})

// Create Cashfree Payment Order
app.post('/api/create-payment', async (req, res) => {
  try {
    const { orderData } = req.body
    
    console.log('Creating Cashfree payment session...')
    console.log('Order Amount:', orderData.amount)
    
    const appId = process.env.VITE_CASHFREE_APP_ID
    const secretKey = process.env.VITE_CASHFREE_SECRET_KEY
    const mode = process.env.VITE_CASHFREE_MODE || 'sandbox'
    
    if (!appId || !secretKey) {
      throw new Error('Cashfree credentials not configured')
    }
    
    // Cashfree API endpoint
    const apiUrl = mode === 'production'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders'
    
    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
        return_url: orderData.returnUrl || 'http://localhost:3003/payment-success',
        notify_url: orderData.notifyUrl || 'http://localhost:3002/api/payment-webhook'
      }
    }
    
    console.log('Calling Cashfree API:', apiUrl)
    console.log('Order ID:', orderId)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Cashfree API Error:', data)
      throw new Error(data.message || 'Failed to create payment session')
    }
    
    console.log('✓ Payment session created successfully')
    console.log('Session ID:', data.payment_session_id)
    
    res.json({
      success: true,
      data: data,
      order_id: orderId
    })
    
  } catch (error) {
    console.error('Payment creation error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Verify Payment Status
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { orderId } = req.body
    
    const appId = process.env.VITE_CASHFREE_APP_ID
    const secretKey = process.env.VITE_CASHFREE_SECRET_KEY
    const mode = process.env.VITE_CASHFREE_MODE || 'sandbox'
    
    const apiUrl = mode === 'production'
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01'
      }
    })
    
    const data = await response.json()
    
    res.json({
      success: true,
      data: data
    })
    
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Payment Webhook (for Cashfree callbacks)
app.post('/api/payment-webhook', async (req, res) => {
  try {
    console.log('Payment webhook received:', req.body)
    
    // Process webhook data here
    // Update order status in your database
    
    res.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ success: false })
  }
})

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Payment API Server Started!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📡 Server running on: http://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log(`💳 Payment API: http://localhost:${PORT}/api/create-payment`)
  console.log(`✅ Verify API: http://localhost:${PORT}/api/verify-payment`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Mode: ${process.env.VITE_CASHFREE_MODE || 'sandbox'}`)
  console.log(`App ID: ${process.env.VITE_CASHFREE_APP_ID ? '✓ Configured' : '✗ Missing'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})
