#!/bin/bash

# Start Payment Server for Real-Time Payments
echo "🚀 Starting Payment Server for Real-Time Payments..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cashfree Payment Gateway Configuration
VITE_CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
VITE_CASHFREE_SECRET_KEY=REDACTED_CASHFREE_SECRET_KEY
VITE_CASHFREE_MODE=sandbox

# Backend Server Configuration
VITE_BACKEND_URL=http://localhost:3002

# Development Settings
NODE_ENV=development
EOF
    echo "✅ Created .env file. Please update with your actual credentials."
fi

# Start the payment server
echo "🏃 Starting payment server on port 3002..."
node server.js

echo "✅ Payment server started successfully!"
echo "🌐 Server running on: http://localhost:3002"
echo "🏥 Health check: http://localhost:3002/health"
echo "💳 Payment API: http://localhost:3002/api/create-payment"
