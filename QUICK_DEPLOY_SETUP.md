# 🚀 Quick Deploy Setup - Your Cashfree Credentials

## 🔐 Your Cashfree Credentials:
-- **App ID:** `REDACTED_CASHFREE_APP_ID`
-- **Secret Key:** `REDACTED_CASHFREE_SECRET_KEY`
- **Mode:** `production`

## 🚀 Quick Deployment Options:

### Option 1: Netlify Dashboard (Easiest)
1. **Go to:** [netlify.com](https://netlify.com)
2. **Click:** "New site from Git"
3. **Connect:** Your GitHub repository
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. **Deploy!**

### Option 2: Netlify CLI (Fast)
```bash
# Run the deployment script
./deploy-to-netlify.sh
```

### Option 3: Manual CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## 🔧 Environment Variables to Set:

In your Netlify dashboard → Site settings → Environment variables:

```bash
# Required Variables (set in deployment UI; do NOT commit)
CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
CASHFREE_SECRET_KEY=REDACTED_CASHFREE_SECRET_KEY
CASHFREE_MODE=production
```

## 🔗 URLs for Cashfree Dashboard:

After deployment, you'll get a URL like: `https://your-site-name.netlify.app`

### Configure these URLs in your Cashfree dashboard:

**Webhook URL:**
```
https://your-site-name.netlify.app/.netlify/functions/payment-webhook
```

**Return URL:**
```
https://your-site-name.netlify.app/payment-success
```

## 🧪 Test Your Deployment:

1. **Open your deployed app**
2. **Add products to cart**
3. **Go to checkout**
4. **Select online payment**
5. **✅ Real Cashfree payment should work!**

## 📋 Cashfree Dashboard Setup:

1. **Go to:** [merchant.cashfree.com](https://merchant.cashfree.com)
2. **Navigate to:** Settings → Webhooks
3. **Set Webhook URL:** `https://your-site-name.netlify.app/.netlify/functions/payment-webhook`
4. **Set Return URL:** `https://your-site-name.netlify.app/payment-success`
5. **Enable webhook events:** Payment Success, Failure, Pending

## 🎉 Result:

Your e-commerce app with real Cashfree payments will be live and ready for production use!

**Deployment time: ~5-10 minutes**
**Setup time: ~5 minutes**
**Total time: ~15 minutes to go live!**
