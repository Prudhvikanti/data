-- ==========================================
-- QuickCommerce - SIMPLE & GUARANTEED Setup
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ==========================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create Tables (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS order_tracking CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  unit TEXT DEFAULT 'unit',
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Addresses
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_type TEXT DEFAULT 'home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  door_number TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_address_id UUID REFERENCES user_addresses(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  payment_type TEXT DEFAULT 'cod',
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  delivery_instructions TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Tracking
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Step 4: Create Simple Policies (Allow All for Testing)
-- Categories - Everyone can read
CREATE POLICY "allow_read_categories" ON categories FOR SELECT USING (true);

-- Products - Everyone can read
CREATE POLICY "allow_read_products" ON products FOR SELECT USING (true);

-- User Addresses - Users manage their own
CREATE POLICY "users_crud_own_addresses" ON user_addresses 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders - Users manage their own
CREATE POLICY "users_crud_own_orders" ON orders 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Order Items - Users can see/create their order items
CREATE POLICY "users_manage_order_items" ON order_items 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Order Tracking - Users can see their order tracking, anyone can insert
CREATE POLICY "users_read_order_tracking" ON order_tracking 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_tracking.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "allow_insert_order_tracking" ON order_tracking 
  FOR INSERT WITH CHECK (true);

-- Step 5: Create Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_tracking_order ON order_tracking(order_id);

-- Step 6: Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Insert Sample Data
INSERT INTO categories (name, emoji) VALUES
  ('Groceries', '🛒'),
  ('Fruits', '🍎'),
  ('Vegetables', '🥬'),
  ('Dairy', '🥛'),
  ('Snacks', '🍪'),
  ('Beverages', '🥤')
ON CONFLICT DO NOTHING;

-- Step 8: Verification
-- Check if tables were created
SELECT 
  'Tables created: ' || count(*)::text as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products', 'user_addresses', 'orders', 'order_items', 'order_tracking');

-- ==========================================
-- SETUP COMPLETE! ✅
-- ==========================================
-- Now you can:
-- 1. Close SQL Editor
-- 2. Go back to your app
-- 3. Try creating an order
-- It should work now!
-- ==========================================

