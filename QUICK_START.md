# 🚀 Quick Start - 5 Minutes to Launch!

## Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

## Step 2: Create Supabase Project (2 minutes)
1. Go to **https://supabase.com**
2. Click **"New Project"**
3. Fill in:
   - Name: `quickcommerce`
   - Password: (anything you want)
   - Region: (pick closest)
4. Click **"Create project"** and wait ~2 minutes

## Step 3: Get Your Keys (30 seconds)
1. In Supabase, click **Settings** (⚙️) → **API**
2. Copy two things:
   - **Project URL** 
   - **anon public key**

## Step 4: Create .env File (30 seconds)
Create a file named `.env` in the project root:

```bash
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

Replace `your_url_here` and `your_key_here` with what you copied!

## Step 5: Setup Database (1 minute)
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `database.sql` from this project
4. Copy EVERYTHING from that file
5. Paste in SQL Editor
6. Click **"Run"** button

You should see: ✅ "Success. No rows returned"

## Step 6: Disable Email Confirmation (30 seconds)
1. In Supabase, go to **Authentication** → **Providers**
2. Click on **Email**
3. Turn OFF: **"Confirm email"**
4. Click **Save**

## Step 7: Start the App! (10 seconds)
```bash
npm run dev
```

Open **http://localhost:3000** in your browser! 🎉

## Test It Out!

### Create Account:
1. Click **"Sign In"** → **"Sign Up"**
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click **"Sign Up"**

### Shop:
1. Browse products on homepage
2. Click any product
3. Click **"Add to Cart"** 🛒
4. Click cart icon (top right)
5. Click **"Proceed to Checkout"**
6. Fill address and place order!

## Troubleshooting

**❌ Can't connect to Supabase**
- Check your `.env` file has correct URL and key
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

**❌ No products showing**
- Make sure you ran `database.sql` in Supabase SQL Editor
- Check Table Editor in Supabase - should see products table

**❌ Can't sign up**
- Make sure you disabled email confirmation in Supabase
- Try a different email address

## 🎉 That's it! You're live!

- **Change colors**: Edit `tailwind.config.js`
- **Add products**: Supabase → Table Editor → products
- **Full docs**: See `README.md`

Enjoy! 🚀

