#!/bin/bash

# 🚀 Netlify Deployment Script for E-commerce App with Cashfree Payments

echo "🚀 Starting Netlify Deployment Process..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please login to Netlify..."
    netlify login
fi

echo "🏗️ Building the application..."
npm run build

echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next Steps:"
echo "1. Go to your Netlify dashboard"
echo "3. Set environment variables (do NOT commit these values into git):"
echo "   - CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID"
echo "   - CASHFREE_SECRET_KEY=REDACTED_CASHFREE_SECRET_KEY"
echo "   - CASHFREE_MODE=production"
echo "3. Get your site URL and configure Cashfree dashboard"
echo ""
echo "📋 URLs to configure in Cashfree:"
echo "Webhook URL: https://your-site.netlify.app/.netlify/functions/payment-webhook"
echo "Return URL: https://your-site.netlify.app/payment-success"
echo ""
echo "🎉 Your e-commerce app with Cashfree payments is now live!"
