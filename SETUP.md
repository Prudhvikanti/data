# Quick Setup Guide 🚀

Follow these steps to get your QuickCommerce app running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in the details:
   - Project name: `quickcommerce`
   - Database password: (choose a strong password)
   - Region: (choose closest to you)
4. Wait ~2 minutes for setup to complete

### Get Your API Keys
1. In your Supabase dashboard, click on the project
2. Go to **Settings** (gear icon) → **API**
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` `public` key)

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=paste_your_project_url_here
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

## 4. Set Up Database

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the `database.sql` file in this project
4. Copy ALL the contents
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see "Success. No rows returned" - this is correct! ✅

## 5. Verify Database Setup

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - `categories`
   - `products`
   - `orders`
   - `order_items`
3. Click on `products` - you should see 8 sample products

## 6. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication** → **Email Templates**
4. For development, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Scroll to **Email Auth**
   - Turn OFF "Enable email confirmations"

## 7. Start the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000` 🎉

## 8. Test the App

### Create an Account
1. Click "Sign In" or go to `/signup`
2. Enter your details:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Sign Up"

### Browse Products
1. Go to "Products" page
2. Browse through categories
3. Use the search bar
4. Click on a product to see details

### Add to Cart
1. Click the cart icon on any product
2. Adjust quantities with +/- buttons
3. View your cart

### Place an Order
1. Go to cart
2. Click "Proceed to Checkout"
3. Fill in delivery details
4. Place order
5. View in "My Orders"

## Troubleshooting

### Issue: "Invalid API key"
- Double-check your `.env` file
- Make sure there are no extra spaces
- Restart the dev server after changing `.env`

### Issue: "Failed to fetch products"
- Make sure you ran the `database.sql` script
- Check if RLS policies are enabled
- Verify tables exist in Table Editor

### Issue: "Cannot sign up"
- Check Authentication settings in Supabase
- Disable email confirmation for development
- Check browser console for errors

### Issue: "CORS errors"
- Your Supabase URL in `.env` might be wrong
- Check for trailing slashes (should not have one)

## Next Steps

- Customize the products in Supabase Table Editor
- Add your own product images (use image URLs)
- Modify colors in `tailwind.config.js`
- Deploy to Vercel or Netlify

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs (Logs & Analytics section)
3. Verify all steps above were completed
4. Try clearing browser cache

Happy coding! 🎉

