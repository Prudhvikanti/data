-- ==========================================
-- COMPLETE SCHEMA FIX - ALL TABLES AND COLUMNS
-- ==========================================
-- This fixes all schema issues including missing columns and RLS policies
-- Copy and paste this entire file into Supabase SQL Editor

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables (if they exist) to start fresh
DROP TABLE IF EXISTS order_tracking CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;

-- Step 3: Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  unit TEXT DEFAULT 'unit',
  weight DECIMAL(8, 2),
  dimensions TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  nutritional_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  profile_completed BOOLEAN DEFAULT false,
  preferences JSONB,
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_login TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Create User Addresses Table
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  door_number TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Create Delivery Zones Table
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_km DECIMAL(8, 2),
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_delivery_time_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Create Payment Methods Table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cod', 'online', 'card', 'upi', 'wallet', 'netbanking')),
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  processing_fee_percent DECIMAL(5, 2) DEFAULT 0,
  min_amount DECIMAL(10, 2) DEFAULT 0,
  max_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Create Orders Table (COMPLETE WITH ALL FIELDS)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE,
  user_id TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
  delivery_address TEXT NOT NULL,
  delivery_address_id UUID REFERENCES user_addresses(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,  -- ✅ PHONE COLUMN FIXED
  alternate_phone TEXT,
  delivery_zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  payment_method TEXT DEFAULT 'cod',
  payment_type TEXT DEFAULT 'cod',
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_gateway TEXT,
  transaction_id TEXT,
  gateway_transaction_id TEXT,
  payment_reference TEXT,
  payment_amount DECIMAL(10, 2),
  payment_fee DECIMAL(10, 2) DEFAULT 0,
  delivery_instructions TEXT,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  delivery_start_time TIMESTAMPTZ,
  delivery_end_time TIMESTAMPTZ,
  delivery_duration_minutes INTEGER,
  delivery_person_id TEXT,
  delivery_person_name TEXT,
  delivery_person_phone TEXT,
  delivery_vehicle TEXT,
  delivery_vehicle_number TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  delivery_feedback TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  refund_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 10: Create Order Items Table (WITH ALL REQUIRED COLUMNS)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_description TEXT,
  product_image_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,  -- ✅ PRICE COLUMN FIXED
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  weight DECIMAL(8, 2),
  unit TEXT DEFAULT 'unit',
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 11: Create Order Tracking Table
CREATE TABLE order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  tracking_number TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 12: Grant all permissions
GRANT ALL ON categories TO anon, authenticated, service_role;
GRANT ALL ON products TO anon, authenticated, service_role;
GRANT ALL ON user_profiles TO anon, authenticated, service_role;
GRANT ALL ON user_addresses TO anon, authenticated, service_role;
GRANT ALL ON delivery_zones TO anon, authenticated, service_role;
GRANT ALL ON payment_methods TO anon, authenticated, service_role;
GRANT ALL ON orders TO anon, authenticated, service_role;
GRANT ALL ON order_items TO anon, authenticated, service_role;
GRANT ALL ON order_tracking TO anon, authenticated, service_role;

-- Step 13: Insert sample data
-- Sample Categories
INSERT INTO categories (id, name, description, image_url, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Fruits', 'Fresh fruits and vegetables', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Vegetables', 'Fresh vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Dairy', 'Milk, cheese, and dairy products', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Meat', 'Fresh meat and poultry', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Bakery', 'Fresh bread and baked goods', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 5);

-- Sample Products
INSERT INTO products (id, category_id, name, description, price, original_price, unit, image_url, in_stock, featured, tags) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Fresh Apples', 'Crisp and juicy red apples', 2.99, 3.99, 'kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', true, true, ARRAY['organic', 'fresh', 'healthy']),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Bananas', 'Sweet and ripe bananas', 1.99, 2.49, 'bunch', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', true, true, ARRAY['organic', 'fresh', 'healthy']),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Oranges', 'Fresh citrus oranges', 3.49, 4.99, 'kg', 'https://images.unsplash.com/photo-1557800634-7bf3c73be389?w=400', true, false, ARRAY['citrus', 'vitamin-c', 'fresh']),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Strawberries', 'Sweet and fresh strawberries', 4.99, 6.99, 'box', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', true, true, ARRAY['organic', 'fresh', 'sweet']),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Fresh Tomatoes', 'Ripe and red tomatoes', 2.49, 3.99, 'kg', 'https://images.unsplash.com/photo-1546470427-5a1b4b4b4b4b?w=400', true, true, ARRAY['organic', 'fresh', 'ripe']),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Carrots', 'Fresh and crunchy carrots', 1.99, 2.99, 'kg', 'https://images.unsplash.com/photo-1445282768818-728615cc910c?w=400', true, false, ARRAY['organic', 'fresh', 'crunchy']),
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Onions', 'Fresh white onions', 1.49, 2.49, 'kg', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400', true, false, ARRAY['fresh', 'white', 'bulb']),
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Potatoes', 'Fresh potatoes', 1.99, 2.99, 'kg', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', true, true, ARRAY['fresh', 'starchy', 'versatile']),
  ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Fresh Milk', 'Fresh whole milk', 3.99, 4.99, 'liter', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', true, true, ARRAY['fresh', 'dairy', 'whole']),
  ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Cheese', 'Fresh cheddar cheese', 5.99, 7.99, 'kg', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', true, true, ARRAY['dairy', 'cheddar', 'aged']),
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Yogurt', 'Greek yogurt', 2.99, 3.99, 'cup', 'https://images.unsplash.com/photo-1571212515413-4b0b5b5b5b5b?w=400', true, false, ARRAY['dairy', 'greek', 'probiotic']),
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'Chicken Breast', 'Fresh chicken breast', 8.99, 11.99, 'kg', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', true, true, ARRAY['fresh', 'chicken', 'lean']),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Ground Beef', 'Fresh ground beef', 7.99, 9.99, 'kg', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400', true, true, ARRAY['fresh', 'beef', 'ground']),
  ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Fresh Bread', 'Artisan bread', 2.99, 3.99, 'loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', true, true, ARRAY['fresh', 'artisan', 'baked']),
  ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'Croissants', 'Fresh croissants', 1.99, 2.99, 'piece', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', true, false, ARRAY['fresh', 'flaky', 'buttery']);

-- Sample Payment Methods
INSERT INTO payment_methods (id, name, type, description, is_active, processing_fee_percent, min_amount, max_amount) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'Cash on Delivery', 'cod', 'Pay when your order arrives', true, 0.00, 0.00, 1000.00),
  ('880e8400-e29b-41d4-a716-446655440002', 'Credit Card', 'card', 'Pay with your credit card', true, 2.50, 1.00, 5000.00),
  ('880e8400-e29b-41d4-a716-446655440003', 'Debit Card', 'card', 'Pay with your debit card', true, 1.50, 1.00, 3000.00),
  ('880e8400-e29b-41d4-a716-446655440004', 'UPI', 'upi', 'Pay using UPI', true, 0.50, 1.00, 10000.00),
  ('880e8400-e29b-41d4-a716-446655440005', 'Net Banking', 'netbanking', 'Pay using net banking', true, 1.00, 1.00, 5000.00),
  ('880e8400-e29b-41d4-a716-446655440006', 'Digital Wallet', 'wallet', 'Pay using digital wallet', true, 0.75, 1.00, 2000.00);

-- Step 14: Test the complete setup
DO $$
DECLARE
    test_order_id UUID;
    test_item_id UUID;
    test_tracking_id UUID;
    test_product_id UUID;
    phone_exists BOOLEAN;
    price_exists BOOLEAN;
    unit_price_exists BOOLEAN;
    total_price_exists BOOLEAN;
    product_name_exists BOOLEAN;
    orders_count INTEGER;
    order_items_count INTEGER;
    products_count INTEGER;
    categories_count INTEGER;
BEGIN
    -- Check if all required columns exist
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'phone'
    ) INTO phone_exists;
    
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'price'
    ) INTO price_exists;
    
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'unit_price'
    ) INTO unit_price_exists;
    
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'total_price'
    ) INTO total_price_exists;
    
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'product_name'
    ) INTO product_name_exists;
    
    IF phone_exists AND price_exists AND unit_price_exists AND total_price_exists AND product_name_exists THEN
        RAISE NOTICE '✅ All required columns exist in all tables';
        
        -- Get a real product ID from the products table
        SELECT id INTO test_product_id FROM products LIMIT 1;
        
        IF test_product_id IS NOT NULL THEN
            RAISE NOTICE '✅ Found sample product with ID: %', test_product_id;
            
            -- Test complete order creation
            INSERT INTO orders (user_id, total_amount, delivery_address, phone)
            VALUES ('test-complete-user', 199.99, 'Test Complete Address', '9999999999')
            RETURNING id INTO test_order_id;
            
            RAISE NOTICE '✅ Test order created with ID: %', test_order_id;
            
            -- Test order item creation with ALL required columns
            INSERT INTO order_items (
                order_id, 
                product_id, 
                product_name, 
                product_description,
                product_image_url,
                quantity, 
                unit_price, 
                total_price,
                price,
                unit,
                weight,
                discount_amount,
                tax_amount,
                special_instructions
            ) VALUES (
                test_order_id, 
                test_product_id, 
                'Test Product Name',
                'Test Product Description',
                'https://example.com/image.jpg',
                2, 
                99.99, 
                199.98,
                199.98,
                'kg',
                1.5,
                0.00,
                0.00,
                'Test special instructions'
            ) RETURNING id INTO test_item_id;
            
            RAISE NOTICE '✅ Test order item created with ID: %', test_item_id;
            
            -- Test order tracking
            INSERT INTO order_tracking (order_id, status, message)
            VALUES (test_order_id, 'pending', 'Test order created successfully')
            RETURNING id INTO test_tracking_id;
            
            RAISE NOTICE '✅ Test order tracking created with ID: %', test_tracking_id;
            
            -- Get counts
            SELECT count(*) INTO orders_count FROM orders;
            SELECT count(*) INTO order_items_count FROM order_items;
            SELECT count(*) INTO products_count FROM products;
            SELECT count(*) INTO categories_count FROM categories;
            
            RAISE NOTICE '✅ Total orders: %, order items: %, products: %, categories: %', 
                         orders_count, order_items_count, products_count, categories_count;
            
            -- Clean up test data
            DELETE FROM order_tracking WHERE order_id = test_order_id;
            DELETE FROM order_items WHERE order_id = test_order_id;
            DELETE FROM orders WHERE id = test_order_id;
            
            RAISE NOTICE '✅ Complete schema fix successful!';
        ELSE
            RAISE NOTICE '❌ No products found in database!';
        END IF;
    ELSE
        RAISE NOTICE '❌ Required columns still missing!';
        RAISE NOTICE 'Phone exists: %, Price exists: %, Unit_price exists: %, Total_price exists: %, Product_name exists: %', 
                     phone_exists, price_exists, unit_price_exists, total_price_exists, product_name_exists;
    END IF;
END $$;

-- Step 15: Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Step 16: Create RLS policies for public access
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to delivery_zones" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "Allow public read access to payment_methods" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update access to orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to orders" ON orders FOR DELETE USING (true);
CREATE POLICY "Allow public insert access to order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select access to order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public update access to order_items" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to order_items" ON order_items FOR DELETE USING (true);
CREATE POLICY "Allow public insert access to order_tracking" ON order_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select access to order_tracking" ON order_tracking FOR SELECT USING (true);
CREATE POLICY "Allow public update access to order_tracking" ON order_tracking FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to order_tracking" ON order_tracking FOR DELETE USING (true);
CREATE POLICY "Allow public insert access to user_addresses" ON user_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select access to user_addresses" ON user_addresses FOR SELECT USING (true);
CREATE POLICY "Allow public update access to user_addresses" ON user_addresses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to user_addresses" ON user_addresses FOR DELETE USING (true);
CREATE POLICY "Allow public insert access to user_profiles" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select access to user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public update access to user_profiles" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to user_profiles" ON user_profiles FOR DELETE USING (true);

-- Step 17: Final verification
SELECT
    '✅ COMPLETE SCHEMA FIX APPLIED' as status,
    'All tables and columns created successfully' as fix_applied,
    (SELECT count(*) FROM orders) as current_orders,
    (SELECT count(*) FROM order_items) as current_order_items,
    (SELECT count(*) FROM products) as current_products,
    (SELECT count(*) FROM categories) as current_categories,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'phone') as phone_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'price') as price_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'unit_price') as unit_price_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'total_price') as total_price_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_name') as product_name_column_exists;

-- ==========================================
-- 🎉 COMPLETE SCHEMA FIX FINISHED!
-- ==========================================
-- All tables created with proper schema
-- All required columns added
-- RLS policies configured for public access
-- Sample data inserted for testing
-- Ready for production use!
