# 🚀 Quick Setup Guide - Get Started in 5 Minutes

## Complete Setup for QuickCommerce

Follow these steps to get your fully-featured QuickCommerce app running!

---

## 📦 Step 1: Install Dependencies

```bash
cd quickcommerce
npm install
```

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project details
5. Wait 2 minutes for setup

### 2.2: Run Database Scripts

#### First: Run Main Schema
```bash
1. Open Supabase dashboard
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Copy ALL contents of database.sql
5. Paste and click "Run"
6. ✅ Wait for success message
```

#### Second: Run Profile Update
```bash
1. Still in SQL Editor
2. Click "New Query" again
3. Copy ALL contents of database-profile-update.sql
4. Paste and click "Run"
5. ✅ Wait for success message
```

### 2.3: Get API Credentials
```bash
1. Click "Settings" (gear icon, bottom left)
2. Click "API" under Project Settings
3. Copy your:
   - Project URL
   - anon/public key
```

---

## 🔑 Step 3: Configure Environment

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 Step 4: Start Development Server

```bash
npm run dev
```

Open browser: `http://localhost:5173`

---

## ✅ Step 5: Test Complete Flow

### Test 1: Create Account & Profile
```bash
1. Click "Sign Up"
2. Enter: Name, Email, Password
3. Check "Terms" box
4. Click "Create Account"
5. ✅ Redirected to Profile Setup

6. Enter phone number (10 digits)
7. Click "Continue to Address"
8. Fill address details
9. Click "Complete Setup"
10. ✅ Redirected to homepage
```

### Test 2: Browse & Add to Cart
```bash
1. Browse products or restaurants
2. Add items to cart
3. ✅ See toast notification
4. ✅ See sync indicator (bottom-left)
5. Check cart icon (shows count)
```

### Test 3: Place Order
```bash
1. Click cart icon
2. Click "Proceed to Checkout"
3. ✅ Address auto-loaded
4. Select payment method (try COD first)
5. Add delivery instructions
6. Click "Place Order"
7. ✅ Order confirmed
8. ✅ Redirected to orders page
```

### Test 4: Verify Database
```bash
1. Go to Supabase dashboard
2. Click "Table Editor"
3. Check these tables:
   - user_profiles ✅
   - delivery_addresses ✅
   - orders ✅
   - order_items ✅
   - order_tracking ✅
4. See your data!
```

---

## 🎯 Quick Feature Tests

### Test Wishlist:
```bash
- Click heart ❤️ on any product
- See toast: "Added to wishlist"
- Click heart icon in navbar
- See your wishlist page
✅ Works!
```

### Test Quick View:
```bash
- Hover over product card
- Click eye 👁️ icon
- Modal opens with product details
- Add to cart from modal
✅ Works!
```

### Test Restaurants:
```bash
- Click "Restaurants" category
- Browse 6 restaurants
- Click any restaurant
- View menu items
- Add items to cart
✅ Works!
```

### Test Data Persistence:
```bash
- Add items to cart
- Close browser completely
- Reopen and visit site
- ✅ Cart items still there!
```

### Test Chat:
```bash
- Click chat bubble (bottom-right)
- Try quick actions (WhatsApp, Call, Email)
✅ Works!
```

### Test PWA Install:
```bash
- Wait ~10 seconds
- Install banner appears (bottom-right)
- Click "Install App"
- ✅ App installs!
```

---

## 🎨 Customization

### Change Primary Color:
```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    // ... your colors
  }
}
```

### Update Restaurant Data:
```javascript
// src/store/restaurantStore.js
const sampleRestaurants = [
  // Add your restaurants here
]
```

### Change Contact Info:
```javascript
// src/components/ChatBubble.jsx
// Update phone, email, WhatsApp number
```

---

## 🐛 Troubleshooting

### Issue: White screen on startup
**Fix**: Check browser console for errors. Usually missing .env file.

### Issue: "Invalid API key"
**Fix**: 
1. Check .env file exists
2. Verify credentials are correct
3. Restart dev server (npm run dev)

### Issue: Database errors
**Fix**:
1. Verify both SQL files ran successfully
2. Check RLS is enabled
3. Check tables exist in Supabase

### Issue: Profile setup not showing
**Fix**:
1. Verify database-profile-update.sql ran
2. Check user_profiles table exists
3. Check console for errors

### Issue: Orders not saving
**Fix**:
1. Verify user is logged in
2. Check orders table has all columns
3. Check payment_type constraint
4. See console for specific error

---

## 📚 Documentation Reference

### Read These Guides:
1. **MASTER_IMPROVEMENTS_GUIDE.md** - Complete overview
2. **PROFILE_ORDER_SYSTEM_GUIDE.md** - This feature details
3. **DATA_PERSISTENCE_GUIDE.md** - Auto-save system
4. **RESTAURANT_FEATURE_GUIDE.md** - Restaurant system
5. **NEW_NATIVE_FEATURES_GUIDE.md** - Native features
6. **FINAL_UI_IMPROVEMENTS.md** - UI enhancements

---

## 🎉 You're Ready!

Your QuickCommerce app now has:
- ✅ **Complete user system** (signup → profile → orders)
- ✅ **Auto-save everything** (cart, wishlist, forms)
- ✅ **Multiple addresses** (home, work, etc.)
- ✅ **5 payment methods** (COD, online, UPI, card, wallet)
- ✅ **Order tracking** (full history)
- ✅ **Restaurant ordering** (6 restaurants, 30+ items)
- ✅ **Native features** (PWA, voice search, etc.)
- ✅ **Beautiful UI** (gradients, animations)
- ✅ **Mobile-optimized** (touch-first design)
- ✅ **Production-ready** (zero errors)

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)
```bash
1. Push code to GitHub
2. Go to vercel.com
3. Import GitHub repository
4. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. Deploy!
```

### Option 2: Netlify
```bash
1. Run: npm run build
2. Upload dist folder to Netlify
3. Add environment variables
4. Deploy!
```

---

## 📞 Need Help?

### Check:
1. **Console errors** (F12 in browser)
2. **Supabase logs** (in dashboard)
3. **Network tab** (F12 → Network)
4. **Documentation guides** (8 files created)

### Common Issues:
- **Database errors**: Check both SQL files ran
- **Auth errors**: Check .env credentials
- **Build errors**: Delete node_modules, run npm install

---

## 🎊 Enjoy Your App!

Everything is ready to go! Start testing and customize as needed.

**Happy launching!** 🚀✨

---

**Quick Links:**
- 📚 [Master Guide](MASTER_IMPROVEMENTS_GUIDE.md)
- 📋 [Profile System](PROFILE_ORDER_SYSTEM_GUIDE.md)
- 💾 [Data Persistence](DATA_PERSISTENCE_GUIDE.md)
- 🍽️ [Restaurant Feature](RESTAURANT_FEATURE_GUIDE.md)


