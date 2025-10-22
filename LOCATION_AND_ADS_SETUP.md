# 📍 Location Detection & Advertisement Slider Setup

## 🎉 NEW FEATURES ADDED

### 1. 📍 **Automatic Location Detection**
- Detects user location in background
- Shows if service is available in their area
- Caches location for better performance
- Works with browser's Geolocation API

### 2. 🎪 **Advertisement Slider**
- Beautiful auto-rotating banners
- Customizable ads with images
- Mobile-responsive design
- Auto-play with manual controls

### 3. 📦 **Products from JSON**
- Easy product management
- Import from JSON file
- No need to manually edit SQL

---

## 🚀 Quick Start

### Step 1: Set Up Supabase (If Not Done)

```bash
# 1. Go to supabase.com and create project
# 2. Add credentials to .env file:
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here

# 3. Run database.sql in Supabase SQL Editor
```

### Step 2: Import Products from JSON

**Method 1: Using Browser Console (Easiest)**

1. Start your dev server:
```bash
npm run dev
```

2. Open the app in browser (http://localhost:3000)

3. Open browser console (F12 → Console tab)

4. Run this command:
```javascript
import('./src/utils/importProducts.js').then(module => {
  module.importProductsFromJSON().then(result => {
    console.log('Import complete!', result)
  })
})
```

**Method 2: Add Import Button (Temporary)**

Add this to your Home page for easy import:
```jsx
<button onClick={async () => {
  const { importProductsFromJSON } = await import('../utils/importProducts')
  const result = await importProductsFromJSON()
  alert(`Imported ${result.imported} products!`)
}}>
  Import Products
</button>
```

---

## 📍 Configure Location Detection

### Set Your Service Areas

Edit `src/services/locationService.js`:

```javascript
const SERVICE_AREAS = [
  {
    name: "Your City Center",
    center: { 
      lat: 40.7128,  // Replace with your latitude
      lng: -74.0060   // Replace with your longitude
    },
    radius: 10000 // 10km radius in meters
  },
  {
    name: "North District",
    center: { lat: 40.7589, lng: -73.9851 },
    radius: 15000 // 15km radius
  }
  // Add more service areas as needed
]
```

### How to Get Coordinates

1. Go to [Google Maps](https://maps.google.com)
2. Right-click on your location
3. Click on the coordinates to copy them
4. Add to SERVICE_AREAS array

### Test Location Detection

1. Open your app
2. Browser will ask for location permission
3. Allow location access
4. You'll see a banner at top:
   - ✅ Green banner if service available
   - ❌ Red banner if not in service area
   - ⚠️ Yellow banner if location denied

---

## 🎪 Customize Advertisement Slider

Edit `src/components/AdvertisementSlider.jsx`:

```javascript
const ADVERTISEMENTS = [
  {
    id: 1,
    title: "Your Ad Title",
    subtitle: "Your subtitle text",
    image: "https://your-image-url.com/image.jpg",
    bgColor: "from-purple-500 to-pink-500", // Tailwind gradient
    buttonText: "Shop Now",
    buttonLink: "/products"
  },
  // Add more ads...
]
```

### Advertisement Options

**Background Colors:**
- `from-purple-500 to-pink-500` - Purple to Pink
- `from-blue-500 to-cyan-600` - Blue to Cyan
- `from-green-500 to-emerald-600` - Green to Emerald
- `from-red-500 to-orange-600` - Red to Orange
- `from-primary-500 to-primary-600` - Your theme color

**Images:**
- Use Unsplash URLs (already set up)
- Or your own image URLs
- Recommended size: 1200x400px

---

## 📦 Managing Products in JSON

### Edit Products

Open `src/data/products.json`:

```json
{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "🛒"
    }
  ],
  "products": [
    {
      "category": "Category Name",
      "name": "Product Name",
      "description": "Product description...",
      "price": 9.99,
      "original_price": 12.99,
      "unit": "1 lb",
      "featured": true,
      "image_url": "https://..."
    }
  ]
}
```

### Add New Product

1. Open `src/data/products.json`
2. Add to the `products` array:
```json
{
  "category": "Snacks",
  "name": "New Snack",
  "description": "Delicious new snack...",
  "price": 4.99,
  "original_price": 6.99,
  "unit": "200g",
  "featured": false,
  "image_url": "https://images.unsplash.com/..."
}
```
3. Re-import using browser console method

### Find Product Images

**Free Image Sources:**
- [Unsplash](https://unsplash.com) - Free high-quality photos
- [Pexels](https://pexels.com) - Free stock photos
- Format: `https://images.unsplash.com/photo-ID?w=500&h=500&fit=crop`

---

## 🎯 How It Works

### Location Detection Flow

```
1. App loads → Check cache
2. If no cache → Request location
3. Browser asks permission
4. User allows/denies
5. Calculate distance to service areas
6. Show appropriate banner:
   - Available → Green banner
   - Unavailable → Red banner
   - Error → Yellow banner
```

### Location is Cached

- Cached for 1 hour
- Stored in localStorage
- Auto-refreshes when expired
- Manual retry button available

### Service Area Check

```javascript
// Calculates distance using Haversine formula
// Checks if user is within any service area radius
// Returns: { available: true/false, area: "name", distance: meters }
```

---

## ⚙️ Configuration Options

### Location Settings

In `src/services/locationService.js`:

```javascript
// Geolocation options
{
  enableHighAccuracy: true,  // Use GPS if available
  timeout: 10000,            // 10 seconds timeout
  maximumAge: 300000         // Cache for 5 minutes
}

// Cache duration
const CACHE_DURATION = 3600000 // 1 hour in milliseconds
```

### Advertisement Settings

In `src/components/AdvertisementSlider.jsx`:

```javascript
// Auto-advance interval
const timer = setInterval(() => {
  // Change slide
}, 5000) // 5 seconds (5000ms)

// Auto-play resume delay after manual interaction
setTimeout(() => setIsAutoPlaying(true), 10000) // 10 seconds
```

---

## 🧪 Testing

### Test Location Detection

1. **Allow Location:**
   - Browser asks permission
   - Click "Allow"
   - Should show green banner (if in service area)

2. **Deny Location:**
   - Click "Block"
   - Should show yellow warning
   - "Retry" button available

3. **Out of Service Area:**
   - If far from configured areas
   - Shows red "Unavailable" banner
   - Shows distance to nearest area

### Test Advertisement Slider

1. Open homepage
2. Should see rotating ads
3. Wait 5 seconds → auto-advance
4. Click dots → manual navigation
5. Hover arrows (desktop) → show/hide
6. Click button → navigate to link

### Test Products

1. Import products using console
2. Go to Products page
3. Should see all 24 products
4. Check images load
5. Try filtering by category

---

## 📱 Mobile Experience

### Location Banner
- Compact on mobile
- Dismissible (X button)
- Doesn't block content
- Touch-friendly

### Advertisement Slider
- Full width on mobile
- Swipe to navigate (auto-detected)
- Dots for navigation
- Responsive text sizes

### Products Grid
- 2 columns on mobile
- 3 on tablet
- 4 on desktop

---

## 🐛 Troubleshooting

### Location Not Working

**Check 1: Browser Permissions**
```
Chrome: Settings → Privacy → Location
Safari: Preferences → Websites → Location
Firefox: Options → Privacy → Permissions
```

**Check 2: HTTPS Required**
- Geolocation requires HTTPS in production
- Works on localhost for development
- Deploy with SSL certificate

**Check 3: Console Errors**
```
F12 → Console tab → Look for errors
Common: "Geolocation is not supported"
```

### Products Not Showing

**Option 1: Run Import Again**
```javascript
// In browser console
import('./src/utils/importProducts.js').then(module => {
  module.importProductsFromJSON()
})
```

**Option 2: Check Supabase**
- Go to Table Editor
- Check `products` table has data
- Check `categories` table has data

**Option 3: Clear and Re-import**
```sql
-- In Supabase SQL Editor
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;

-- Then re-run import
```

### Ads Not Rotating

**Check:** Auto-play might be paused
- Click on the slider to resume
- Check browser console for errors
- Verify images are loading

---

## 🎨 Customization Examples

### Example 1: Add New Service Area

```javascript
// In src/services/locationService.js
{
  name: "Downtown Los Angeles",
  center: { lat: 34.0522, lng: -118.2437 },
  radius: 8000 // 8km
}
```

### Example 2: Add New Ad

```javascript
// In src/components/AdvertisementSlider.jsx
{
  id: 5,
  title: "🎊 Weekend Special",
  subtitle: "Buy 2 Get 1 Free on all bakery items",
  image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=400&fit=crop",
  bgColor: "from-yellow-500 to-orange-600",
  buttonText: "View Deals",
  buttonLink: "/products?category=bakery"
}
```

### Example 3: Add Bulk Products

```json
// In src/data/products.json
{
  "category": "Beverages",
  "name": "Iced Coffee",
  "description": "Refreshing cold brewed coffee...",
  "price": 3.99,
  "original_price": 4.99,
  "unit": "16 oz",
  "featured": true,
  "image_url": "https://images.unsplash.com/..."
}
```

---

## ✨ Features Summary

### ✅ What You Have Now

1. **Auto Location Detection** in background
2. **Service Area Validation** with distance calculation
3. **Smart Banners** showing availability status
4. **Advertisement Slider** with 4 pre-loaded ads
5. **Products in JSON** for easy management
6. **Import Script** for quick product loading
7. **Mobile Optimized** for all features
8. **Cache System** for better performance

---

## 📚 Next Steps

1. ✅ Configure your service areas
2. ✅ Customize advertisement content
3. ✅ Add/edit products in JSON
4. ✅ Import products to database
5. ✅ Test location detection
6. ✅ Test ad slider
7. ✅ Deploy your app!

---

**Need Help?** Check the main documentation files:
- `README.md` - Complete guide
- `HOW_TO_FIX_PRODUCTS.md` - Setup help
- `QUICK_START.md` - Quick setup

**Everything is ready to go!** 🚀

