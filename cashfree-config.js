// Cashfree Payment Configuration
// Copy these values to your .env file

export const CASHFREE_CONFIG = {
  // Get these from https://merchant.cashfree.com/merchant/pg/onboarding/app
  APP_ID: 'REDACTED_CASHFREE_APP_ID',
  SECRET_KEY: 'REDACTED_CASHFREE_SECRET_KEY', // Replace with your actual secret key
  MODE: 'sandbox', // Change to 'production' for live payments
  
  // Backend server URL
  BACKEND_URL: 'http://localhost:3002',
  
  // API endpoints
  ENDPOINTS: {
    CREATE_PAYMENT: '/api/create-payment',
    VERIFY_PAYMENT: '/api/verify-payment',
    WEBHOOK: '/api/payment-webhook'
  }
}

// Environment variables to set in .env file:
/*
VITE_CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
VITE_CASHFREE_SECRET_KEY=your_actual_secret_key_here
VITE_CASHFREE_MODE=sandbox
VITE_BACKEND_URL=http://localhost:3002
*/
