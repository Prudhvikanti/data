# 🛠️ Fix White Screen Issue

## The Problem
You're seeing a white screen because **Supabase credentials are missing**.

## ✅ SOLUTION - 3 Steps:

### Step 1: Create a Supabase Project (if you haven't)
1. Go to **https://supabase.com**
2. Click **"New Project"**
3. Fill in details and click **"Create project"**
4. Wait ~2 minutes for it to be ready

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings** ⚙️ → **API**
2. You'll see two important values:
   - **Project URL** (something like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 3: Update Your .env File
Open the `.env` file in your project root and replace the placeholder values:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Setup Database
1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy ALL contents from `database.sql` file
4. Paste and click **"Run"**

### Step 5: Restart Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎉 Now it should work!

Open **http://localhost:3000** (or whatever port Vite shows)

---

## Still Having Issues?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. You should see warnings about Supabase if credentials are still wrong

### Verify .env File
```bash
# Make sure the file exists:
ls -la .env

# Check the contents (values should NOT be placeholders):
cat .env
```

### Common Issues:

**❌ Still seeing placeholder URLs?**
- Make sure you replaced BOTH values in `.env`
- No extra spaces or quotes needed
- Just: `VITE_SUPABASE_URL=https://your-url.supabase.co`

**❌ Changes not taking effect?**
- Stop the dev server completely (Ctrl+C)
- Start fresh: `npm run dev`
- Vite needs restart to reload environment variables

**❌ Products not loading?**
- Make sure you ran `database.sql` in Supabase SQL Editor
- Check Supabase → Table Editor → products table should have data

## Quick Test
After fixing, you should see:
1. ✅ Homepage loads with categories
2. ✅ Can click "Products" and see items
3. ✅ No errors in browser console
4. ✅ Can add items to cart

Need more help? See **QUICK_START.md** for complete setup guide!

