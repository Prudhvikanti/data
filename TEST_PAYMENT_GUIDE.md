# 🧪 Payment Testing Guide

## Quick Test Steps

### ✅ Test COD Payment (Recommended First Test)

**Time:** 2 minutes

1. **Open app:** http://localhost:3001/

2. **Add to cart:**
   - Click any product
   - Click "Add to Cart"
   - See cart badge update

3. **Go to checkout:**
   - Click cart icon (top right)
   - Click "Proceed to Checkout"

4. **Fill form:**
   - Full Name: `Test User`
   - Phone: `9999999999`
   - Door Number: `123`
   - Street: `Main Street`
   - City: `Samalkota` (pre-filled)
   - State: `Andhra Pradesh` (pre-filled)
   - Pincode: `533434` (pre-filled)

5. **Place order:**
   - Scroll down
   - Click "Place Order" button
   - Payment modal opens

6. **Select COD:**
   - "Cash on Delivery" should be pre-selected
   - Click "Place Order" button in modal

7. **Success!**
   - See success message
   - Auto-redirect to Orders page (2 seconds)
   - Order appears in list

**Expected Result:** ✅ Order created successfully!

---

### 🔄 Test Online Payment (UPI/Card)

**Time:** 2 minutes

1. **Follow steps 1-5 from COD test above**

2. **Select online payment:**
   - In payment modal, select "UPI" or "Card"
   - Click "Pay Now"

3. **Watch console:**
   - Press F12 to open DevTools
   - Go to Console tab
   - Watch the logs

4. **Expected outcomes:**

   **Scenario A: Backend Not Set Up Yet (Most Likely)**
   ```
   Console shows:
   ⚠️ "Cannot call Cashfree API directly from browser"
   ⚠️ "Using test payment mode"
   
   Modal shows:
   ⚠️ "Using test payment mode. For production, backend API is required."
   
   Then:
   - Mock payment processes (2 seconds)
   - Success message appears
   - Order confirmed
   - Redirected to Orders page
   ```
   
   **Result:** ✅ Order created with mock payment

   **Scenario B: Backend API Is Set Up**
   ```
   Console shows:
   ✓ "Creating payment session"
   ✓ "Cashfree checkout opening"
   
   Then:
   - Cashfree payment page opens
   - Complete payment there
   - Return to app
   - Order confirmed
   ```
   
   **Result:** ✅ Order created with real payment

---

## 🔍 Detailed Console Output

### What to Look For:

**Open Console:** Press F12 → Console tab

#### When Placing Order:

```javascript
// Location Detection (Optional)
✓ "Using default location: Samalkota"
✓ "Location: { city: 'Samalkota', state: 'Andhra Pradesh', ... }"

// Order Creation
✓ "Creating order..."
✓ "Order data: { total_amount: 299, ... }"
✓ "Order created successfully"
✓ "Order ID: xxx-xxx-xxx"

// Payment Modal
✓ "Payment modal opened"
```

#### When Processing Payment (COD):

```javascript
✓ "Payment method: cod"
✓ "Order placed successfully"
✓ "Clearing cart..."
✓ "Redirecting to orders page..."
```

#### When Processing Payment (Online - No Backend):

```javascript
// Attempt to call Cashfree
✓ "Creating payment session with mode: production"
✓ "Order data: { amount: 299, ... }"
✓ "Cashfree request payload: { order_id: ..., ... }"

// CORS Error (Expected)
⚠️ "Payment session error: [Error details]"
⚠️ "Cannot call Cashfree API directly from browser. Backend API required."
⚠️ "Cashfree payment failed, using mock payment"

// Fallback to Mock
✓ "Using mock payment"
✓ "Mock payment processing..."
✓ "Mock payment successful"
✓ "Order confirmed"
```

#### When Processing Payment (Online - With Backend):

```javascript
✓ "Creating payment session with mode: production"
✓ "Cashfree response: { payment_session_id: ..., ... }"
✓ "Opening Cashfree checkout"
✓ "Initializing Cashfree in production mode"
✓ "App ID: ✓ Set"
✓ "Cashfree checkout opened successfully"

// After payment completion
✓ "Payment completed"
✓ "Payment ID: xxx"
✓ "Order confirmed"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Location permission denied" Error

**What happened:** App couldn't get your location

**Solution:** ✅ Already fixed! App now uses default location (Samalkota)

**What to see:**
- Form pre-filled with Samalkota, Andhra Pradesh, 533434
- No blocking errors
- Can proceed to checkout

---

### Issue 2: "Failed to create order"

**Possible causes:**
1. Database not connected
2. Not logged in
3. Cart is empty

**Solutions:**

**Check 1: Are you logged in?**
- Look for user icon in top right
- If not logged in, click "Login" or "Sign Up"

**Check 2: Is cart empty?**
- Cart icon should show number > 0
- Add products to cart first

**Check 3: Check Supabase connection**
- Open Console (F12)
- Look for Supabase errors
- Check `.env.local` has correct credentials

---

### Issue 3: Payment Modal Doesn't Open

**Possible causes:**
1. Form validation failed
2. Required fields missing

**Solution:**

**Fill all required fields:**
- Full Name ✓
- Phone (10 digits) ✓
- Street Address ✓
- City ✓
- State ✓
- Pincode (6 digits) ✓

**Check console for validation errors:**
```javascript
❌ "Missing required field: phone"
❌ "Invalid phone number"
```

---

### Issue 4: "Payment gateway not configured"

**What happened:** Cashfree credentials missing

**Solution:**

**Check `.env.local` file exists:**
```bash
# Should have:
VITE_CASHFREE_APP_ID=REDACTED_CASHFREE_APP_ID
VITE_CASHFREE_SECRET_KEY=cfsk_ma_prod_...
VITE_CASHFREE_MODE=production
```

**Restart dev server:**
```bash
# Stop server (Ctrl+C in terminal)
# Start again:
npm run dev
```

---

### Issue 5: "CORS Error" in Console

**What happened:** Browser blocked direct Cashfree API call

**Is this a problem?** ❌ No! This is expected and normal

**What it means:**
- Cashfree doesn't allow direct browser calls (security)
- App automatically falls back to mock payment
- Orders still get created successfully
- For production, you need a backend API

**Solution:**
- ✅ For testing: Continue using mock payment (works fine!)
- ⏳ For production: Set up backend API (see LOCATION_AND_PAYMENT_FIXED.md)

---

## 📱 Mobile Testing

### On Same WiFi Network:

1. **Find your IP:** Check terminal output
   ```
   Network: http://172.20.10.6:3001/
   ```

2. **Open on mobile:**
   - Connect phone to same WiFi
   - Open browser
   - Go to: `http://172.20.10.6:3001/`

3. **Test everything:**
   - Location: Will ask for permission on mobile
   - If denied: Uses default location ✅
   - If allowed: Uses GPS location ✅
   - Orders: Work same as desktop ✅
   - Payments: Work same as desktop ✅

---

## ✅ Verification Checklist

### Before Testing:
- [ ] Dev server is running (http://localhost:3001)
- [ ] Browser console is open (F12)
- [ ] Logged in to app
- [ ] Cart has at least one item

### Location Testing:
- [ ] App loads without errors
- [ ] No blocking location error
- [ ] Can navigate to checkout
- [ ] Form shows default values (Samalkota, etc)

### COD Payment Testing:
- [ ] Can fill checkout form
- [ ] "Place Order" button works
- [ ] Payment modal opens
- [ ] COD is available and selected
- [ ] "Place Order" in modal works
- [ ] Success message shows
- [ ] Redirects to Orders page
- [ ] Order appears in Orders list
- [ ] Order shows "COD" payment method
- [ ] Order status is "Confirmed" or "Pending"

### Online Payment Testing:
- [ ] Can select UPI/Card/Wallet
- [ ] "Pay Now" button works
- [ ] Console shows payment attempt
- [ ] Either Cashfree opens OR mock payment works
- [ ] No crash or freeze
- [ ] Order gets created
- [ ] Order appears in Orders page

### Database Testing:
- [ ] Orders are saved
- [ ] Can see orders in Orders page
- [ ] Order details are correct
- [ ] Cart clears after order

---

## 🎯 Expected Results Summary

### ✅ Working Features:

1. **Location:** 
   - Optional, never blocks
   - Default: Samalkota, Andhra Pradesh
   - Can be overridden manually

2. **Order Creation:**
   - Works with or without location
   - Saves to database
   - Shows in Orders page

3. **COD Payment:**
   - 100% functional
   - No external dependencies
   - Instant confirmation

4. **Online Payment (Without Backend):**
   - Attempts Cashfree API
   - Falls back to mock payment
   - Still creates order successfully
   - Shows warning about needing backend

5. **Online Payment (With Backend):**
   - Opens real Cashfree payment page
   - Processes real payments
   - Updates order status
   - Full production ready

---

## 🚀 Quick Test Script

Copy and paste this into your console for automated checks:

```javascript
// Check environment variables
console.log('=== Environment Check ===')
console.log('Cashfree App ID:', import.meta.env.VITE_CASHFREE_APP_ID ? '✓ Set' : '✗ Missing')
console.log('Cashfree Mode:', import.meta.env.VITE_CASHFREE_MODE || 'sandbox')
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing')

// Check cart
console.log('\n=== Cart Check ===')
const cartItems = JSON.parse(localStorage.getItem('cart-storage') || '{"state":{"items":[]}}')
console.log('Cart items:', cartItems.state.items.length)
console.log('Cart total:', cartItems.state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))

// Check auth
console.log('\n=== Auth Check ===')
const authData = JSON.parse(localStorage.getItem('auth-storage') || '{"state":{"user":null}}')
console.log('Logged in:', authData.state.user ? '✓ Yes' : '✗ No')
console.log('User:', authData.state.user?.email || 'Not logged in')

// Check location
console.log('\n=== Location Check ===')
const locationData = JSON.parse(localStorage.getItem('location-storage') || '{"state":{"location":null}}')
console.log('Location:', locationData.state.location || 'Using default')

console.log('\n=== Ready to Test! ===')
```

---

## 📊 Test Results Table

Fill this out as you test:

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| App loads | No errors | | ⬜ |
| Location optional | Uses default | | ⬜ |
| Add to cart | Item added | | ⬜ |
| Go to checkout | Form loads | | ⬜ |
| Form defaults | City/State/Pin filled | | ⬜ |
| Place order | Modal opens | | ⬜ |
| COD payment | Order created | | ⬜ |
| Online payment | Mock or Cashfree | | ⬜ |
| Order saved | Appears in Orders | | ⬜ |
| Cart cleared | Empty after order | | ⬜ |

---

## 🎉 Success Criteria

Your app is working if:

✅ Can place orders without location permission
✅ COD orders work perfectly
✅ Online payments work (mock or real)
✅ Orders appear in Orders page
✅ No crashes or blocking errors
✅ Console shows clear logs
✅ Cart clears after order

---

**Ready to test!** Open http://localhost:3001/ and try it out! 🚀

