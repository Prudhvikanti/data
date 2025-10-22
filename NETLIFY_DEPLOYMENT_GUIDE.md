# 🚀 Netlify Deployment Guide with Your Cashfree Credentials

## 🔐 Your Cashfree Credentials:
- **App ID:** `REDACTED_CASHFREE_APP_ID`
- **Secret Key:** `REDACTED_CASHFREE_SECRET_KEY`
- **Mode:** `production` (since you have production credentials)

## 🚀 Step-by-Step Deployment

### Step 1: Push to GitHub (if not already done)

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify

**Option A: Netlify Dashboard (Recommended)**
1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Connect your GitHub repository
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

**Option B: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Step 3: Configure Environment Variables

In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```bash
# Required Variables
CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
CASHFREE_SECRET_KEY=REDACTED_CASHFREE_SECRET_KEY
CASHFREE_MODE=production

# Optional Variables
CASHFREE_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 4: Get Your Production URLs

After deployment, your site will be available at:
```
https://your-site-name.netlify.app
```

## 🔗 URLs for Cashfree Dashboard Configuration

### 1. **Webhook URL** (for Cashfree dashboard):
```
https://your-site-name.netlify.app/.netlify/functions/payment-webhook
```

### 2. **Return URL** (for Cashfree dashboard):
```
https://your-site-name.netlify.app/payment-success
```

### 3. **Function Endpoints**:
```
https://your-site-name.netlify.app/.netlify/functions/create-payment
https://your-site-name.netlify.app/.netlify/functions/verify-payment
```

## 🛠️ Cashfree Dashboard Configuration

### In your Cashfree Merchant Dashboard:

1. **Go to:** [merchant.cashfree.com](https://merchant.cashfree.com)
2. **Navigate to:** Settings → Webhooks
3. **Set Webhook URL:** `https://your-site-name.netlify.app/.netlify/functions/payment-webhook`
4. **Set Return URL:** `https://your-site-name.netlify.app/payment-success`

### Webhook Events to Enable:
- ✅ Payment Success
- ✅ Payment Failure
- ✅ Payment Pending
- ✅ Refund Success
- ✅ Refund Failure

## 🧪 Testing Your Deployment

### Test 1: Function Endpoints

**Test Create Payment:**
```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderData": {
      "amount": "299.99",
      "customerId": "CUST_123",
      "customerEmail": "test@example.com",
      "customerPhone": "9999999999",
      "customerName": "Test Customer"
    }
  }'
```

**Test Verify Payment:**
```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_123456"}'
```

### Test 2: Main App

1. **Open your deployed app:** `https://your-site-name.netlify.app`
2. **Add products to cart**
3. **Go to checkout**
4. **Select online payment**
5. **✅ Real Cashfree payment should work!**

## 🔧 Local Development (Optional)

If you want to test locally with Netlify functions:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development
netlify dev

# Your functions will be available at:
# http://localhost:8888/.netlify/functions/create-payment
# http://localhost:8888/.netlify/functions/verify-payment
# http://localhost:8888/.netlify/functions/payment-webhook
```

## 📊 Monitoring Your Deployment

### Netlify Dashboard:
1. Go to your site dashboard
2. Check **Functions** tab for logs
3. Monitor **Deploys** for build status
4. View **Analytics** for usage

### Function Logs:
- All payment functions include comprehensive logging
- Check Netlify dashboard → Functions → View logs
- Monitor for any errors or issues

## 🎯 Production Checklist

### ✅ Before Going Live:
- [ ] Environment variables configured
- [ ] Cashfree webhook URL set
- [ ] Cashfree return URL set
- [ ] Test payment flow works
- [ ] Webhook handling works
- [ ] Error handling works

### ✅ After Going Live:
- [ ] Monitor function logs
- [ ] Test with real payments
- [ ] Verify webhook processing
- [ ] Check payment confirmations

## 🐛 Troubleshooting

### Issue 1: Functions not working
**Solution:** Check environment variables are set correctly

### Issue 2: CORS errors
**Solution:** Functions include proper CORS headers

### Issue 3: Webhook not receiving data
**Solution:** Verify webhook URL in Cashfree dashboard

### Issue 4: Payment not processing
**Solution:** Check function logs in Netlify dashboard

## 🎉 Result

After deployment, you'll have:
- ✅ **Production-ready e-commerce app**
- ✅ **Serverless payment processing**
- ✅ **Real Cashfree integration**
- ✅ **Automatic scaling**
- ✅ **Secure credential handling**

## 📞 Support

If you need help:
1. Check Netlify dashboard for function logs
2. Verify environment variables are set
3. Test functions individually
4. Check Cashfree dashboard configuration

Your app will be live at: `https://your-site-name.netlify.app`
