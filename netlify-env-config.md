# 🔐 Netlify Environment Variables Configuration

## Your Cashfree Credentials:
- **App ID:** REDACTED_CASHFREE_APP_ID
- **Secret Key:** REDACTED_CASHFREE_SECRET_KEY
- **Mode:** production (since you have production credentials)

## Environment Variables to Set in Netlify:

### Required Variables:
```bash
CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
CASHFREE_SECRET_KEY=REDACTED_CASHFREE_SECRET_KEY
CASHFREE_MODE=production
```

### Optional Variables:
```bash
CASHFREE_WEBHOOK_SECRET=your_webhook_secret_here
```

## How to Set Environment Variables in Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Add each variable with its value
6. Click **Save**

## Production URLs (will be provided after deployment):

### Webhook URL:
```
https://your-site-name.netlify.app/.netlify/functions/payment-webhook
```

### Return URL:
```
https://your-site-name.netlify.app/payment-success
```

### Function Endpoints:
```
https://your-site-name.netlify.app/.netlify/functions/create-payment
https://your-site-name.netlify.app/.netlify/functions/verify-payment
```
