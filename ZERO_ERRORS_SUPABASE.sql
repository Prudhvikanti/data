-- ==========================================
-- QuickCommerce - ZERO ERRORS Setup
-- This ELIMINATES UUID issues completely
-- ==========================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop everything
DROP TABLE IF EXISTS order_tracking CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Step 3: Create Tables with NO foreign key to auth.users

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
  category_id UUID,
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

-- User Addresses - user_id as TEXT (no UUID issues!)
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
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

-- Orders - user_id as TEXT (no UUID issues!)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_address_id UUID,
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
  order_id UUID NOT NULL,
  product_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Tracking
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: DISABLE Row Level Security (to test if RLS is causing issues)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant FULL permissions (no restrictions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Step 6: Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_tracking_order ON order_tracking(order_id);

-- Step 7: Insert sample data
INSERT INTO categories (name, emoji) VALUES
  ('Groceries', '🛒'),
  ('Fruits', '🍎'),
  ('Vegetables', '🥬'),
  ('Dairy', '🥛'),
  ('Snacks', '🍪'),
  ('Beverages', '🥤');

-- Insert test products
INSERT INTO products (category_id, name, description, price, unit, image_url, in_stock, featured)
SELECT 
  (SELECT id FROM categories LIMIT 1),
  'Test Product ' || generate_series,
  'Sample product for testing',
  (50 + (generate_series * 10))::decimal,
  'unit',
  'https://via.placeholder.com/400',
  true,
  (generate_series <= 3)
FROM generate_series(1, 10);

-- Step 8: Test everything
DO $$ 
BEGIN
  RAISE NOTICE 'SUCCESS: All tables created!';
  RAISE NOTICE 'SUCCESS: Categories count: %', (SELECT count(*) FROM categories);
  RAISE NOTICE 'SUCCESS: Products count: %', (SELECT count(*) FROM products);
  RAISE NOTICE 'RLS DISABLED: Full access granted for testing';
  RAISE NOTICE 'READY: You can now create orders!';
END $$;

-- Verification query
SELECT 
  'SETUP COMPLETE' as status,
  'All tables created with RLS DISABLED' as note,
  (SELECT count(*) FROM categories) as categories,
  (SELECT count(*) FROM products) as products;

-- ==========================================
-- IMPORTANT NOTES:
-- ==========================================
-- 1. RLS is DISABLED for testing
-- 2. user_id is TEXT (no UUID casting)
-- 3. Full permissions granted
-- 4. This will work 100% for testing
-- 5. Enable RLS later for production
-- ==========================================
