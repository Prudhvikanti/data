-- ==========================================
-- QuickCommerce - FIXED Database Setup
-- This fixes UUID syntax errors and order creation
-- ==========================================

-- Step 1: Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables to start fresh
DROP TABLE IF EXISTS order_tracking CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Step 3: Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create Products Table
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

-- Step 5: Create User Addresses Table
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
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

-- Step 6: Create Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
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

-- Step 7: Create Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Create Order Tracking Table
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Step 10: Create Policies (Simple - Allow All for Testing)
-- Categories - Everyone can read
CREATE POLICY "allow_read_categories" ON categories FOR SELECT USING (true);

-- Products - Everyone can read
CREATE POLICY "allow_read_products" ON products FOR SELECT USING (true);

-- User Addresses - Users can manage their own
CREATE POLICY "users_manage_addresses" ON user_addresses 
  FOR ALL USING (auth.uid()::text = user_id::text) 
  WITH CHECK (auth.uid()::text = user_id::text);

-- Orders - Users can manage their own
CREATE POLICY "users_manage_orders" ON orders 
  FOR ALL USING (auth.uid()::text = user_id::text) 
  WITH CHECK (auth.uid()::text = user_id::text);

-- Order Items - Users can manage their order items
CREATE POLICY "users_manage_order_items" ON order_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND auth.uid()::text = orders.user_id::text
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND auth.uid()::text = orders.user_id::text
    )
  );

-- Order Tracking - Users can read their tracking, anyone can insert
CREATE POLICY "users_read_tracking" ON order_tracking 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking.order_id 
      AND auth.uid()::text = orders.user_id::text
    )
  );

CREATE POLICY "allow_insert_tracking" ON order_tracking 
  FOR INSERT WITH CHECK (true);

-- Step 11: Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order ON order_tracking(order_id);

-- Step 12: Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 13: Insert Sample Data
INSERT INTO categories (name, emoji) VALUES
  ('Groceries', '🛒'),
  ('Fruits', '🍎'),
  ('Vegetables', '🥬'),
  ('Dairy', '🥛'),
  ('Snacks', '🍪'),
  ('Beverages', '🥤')
ON CONFLICT DO NOTHING;

-- Step 14: Test Insert (Verify everything works)
INSERT INTO products (name, description, price, unit, image_url, in_stock, featured) VALUES
  ('Sample Product', 'This is a test product', 99.99, 'kg', 'https://via.placeholder.com/400', true, true)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SETUP COMPLETE! ✅
-- ==========================================
-- This should fix:
-- 1. UUID syntax errors
-- 2. Order creation failures
-- 3. Database permission issues
-- ==========================================

-- Verification query
SELECT 
  'Database setup complete!' as status,
  count(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products', 'user_addresses', 'orders', 'order_items', 'order_tracking');
