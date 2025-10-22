# 🚀 How to Start Your QuickCommerce App

## ✅ Quick Start (Choose One Method)

### Method 1: Start Both at Once (Recommended)

```bash
npm start
```

This will start:
- Frontend (Vite) on **http://localhost:3001/**
- Backend (Express) on **http://localhost:3002/**

---

### Method 2: Start Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🌐 Access Points

After starting:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3001/ | Main app |
| Backend API | http://localhost:3002/ | Payment server |
| Backend Health | http://localhost:3002/health | Server status |
| Mobile Access | http://172.20.10.6:3001/ | Same WiFi |

---

## ✅ Verify Everything is Working

### 1. Check Backend:
```bash
curl http://localhost:3002/health
```

**Expected:**
```json
{
  "status": "ok",
  "message": "Payment API Server Running",
  "timestamp": "2025-10-19T..."
}
```

### 2. Check Frontend:
Open browser: `http://localhost:3001/`

### 3. Check Console:
**Backend Terminal Should Show:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Payment API Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:3002
🏥 Health check: http://localhost:3002/health
💳 Payment API: http://localhost:3002/api/create-payment
✅ Verify API: http://localhost:3002/api/verify-payment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode: production
App ID: ✓ Configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Frontend Terminal Should Show:**
```
VITE v5.4.20  ready in 161 ms
➜  Local:   http://localhost:3001/
➜  Network: http://172.20.10.6:3001/
➜  press h + enter to show help
```

---

## 🎯 Quick Test Flow

1. **Open:** http://localhost:3001/
2. **Login/Signup** (if not logged in)
3. **Add products** to cart
4. **Go to checkout**
5. **Fill address** (defaults pre-filled)
6. **Place order**
7. **Select payment method:**
   - COD: Instant confirmation ✅
   - Online: Cashfree opens, complete payment ✅
8. **Payment Success** page shows
9. **Auto-redirect** to Orders (5 seconds)
10. **✅ Done!**

---

## 🛑 Stop Servers

### If using `npm start`:
Press `Ctrl+C` once (stops both)

### If started separately:
Press `Ctrl+C` in each terminal

---

## 🐛 Troubleshooting

### Port Already in Use:

**Error:** `Port 3001 is in use`

**Solution:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3002
lsof -ti:3002 | xargs kill -9

# Then restart
npm start
```

---

### Backend Not Starting:

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
npm install
```

---

### Frontend Can't Connect to Backend:

**Check:**
1. Is backend running? (should see server started message)
2. Try: `curl http://localhost:3002/health`
3. Check if port 3002 is available

---

## 📋 Environment Check

Before starting, make sure `.env.local` exists with:

```bash
# Cashfree
VITE_CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
VITE_CASHFREE_SECRET_KEY=cfsk_ma_prod_***
VITE_CASHFREE_MODE=production

# Supabase
VITE_SUPABASE_URL=https://xifvcnyqounfbmcgzwen.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🎉 You're Ready!

Start servers and test payments:

```bash
npm start
```

Then open: **http://localhost:3001/** 

**Everything is 100% working!** 💯✅

---

**Documentation:**
- 📄 `💯_PAYMENT_100_PERCENT_WORKING.md` - Complete payment guide
- 📄 `TEST_PAYMENT_GUIDE.md` - Testing instructions
- 📄 `✅_ALL_FIXED_START_HERE.md` - Quick overview

