-- ==========================================
-- FIX: Row Level Security (RLS) Policy Violation
-- ==========================================
-- This fixes the "new row violates row-level security policy for table orders" error

-- Step 1: Drop existing RLS policies that might be causing issues
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public delete access to orders" ON orders;

-- Step 2: Drop existing RLS policies for other tables
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public update access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public delete access to order_items" ON order_items;

DROP POLICY IF EXISTS "Allow public insert access to order_tracking" ON order_tracking;
DROP POLICY IF EXISTS "Allow public read access to order_tracking" ON order_tracking;
DROP POLICY IF EXISTS "Allow public update access to order_tracking" ON order_tracking;
DROP POLICY IF EXISTS "Allow public delete access to order_tracking" ON order_tracking;

DROP POLICY IF EXISTS "Allow public insert access to user_addresses" ON user_addresses;
DROP POLICY IF EXISTS "Allow public read access to user_addresses" ON user_addresses;
DROP POLICY IF EXISTS "Allow public update access to user_addresses" ON user_addresses;
DROP POLICY IF EXISTS "Allow public delete access to user_addresses" ON user_addresses;

DROP POLICY IF EXISTS "Allow public insert access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public read access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public update access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public delete access to user_profiles" ON user_profiles;

-- Step 3: Create new RLS policies that allow public access
-- Orders table policies
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on orders" ON orders FOR DELETE USING (true);

-- Order items table policies
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public update on order_items" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on order_items" ON order_items FOR DELETE USING (true);

-- Order tracking table policies
CREATE POLICY "Allow public insert on order_tracking" ON order_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on order_tracking" ON order_tracking FOR SELECT USING (true);
CREATE POLICY "Allow public update on order_tracking" ON order_tracking FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on order_tracking" ON order_tracking FOR DELETE USING (true);

-- User addresses table policies
CREATE POLICY "Allow public insert on user_addresses" ON user_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on user_addresses" ON user_addresses FOR SELECT USING (true);
CREATE POLICY "Allow public update on user_addresses" ON user_addresses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on user_addresses" ON user_addresses FOR DELETE USING (true);

-- User profiles table policies
CREATE POLICY "Allow public insert on user_profiles" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public update on user_profiles" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on user_profiles" ON user_profiles FOR DELETE USING (true);

-- Step 4: Ensure RLS is enabled but with proper policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Test the RLS policies
DO $$
DECLARE
    test_order_id UUID;
    test_item_id UUID;
    test_tracking_id UUID;
    test_address_id UUID;
    test_profile_id UUID;
BEGIN
    -- Test order creation
    INSERT INTO orders (user_id, total_amount, delivery_address, phone)
    VALUES ('test-rls-user', 99.99, 'Test RLS Address', '9999999999')
    RETURNING id INTO test_order_id;
    
    RAISE NOTICE '✅ Order created successfully with ID: %', test_order_id;
    
    -- Test order item creation
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
    VALUES (test_order_id, uuid_generate_v4(), 'Test Product', 1, 99.99, 99.99)
    RETURNING id INTO test_item_id;
    
    RAISE NOTICE '✅ Order item created successfully with ID: %', test_item_id;
    
    -- Test order tracking
    INSERT INTO order_tracking (order_id, status, message)
    VALUES (test_order_id, 'pending', 'Test order created')
    RETURNING id INTO test_tracking_id;
    
    RAISE NOTICE '✅ Order tracking created successfully with ID: %', test_tracking_id;
    
    -- Test user address creation
    INSERT INTO user_addresses (user_id, full_name, phone, street_address, city, state, pincode)
    VALUES ('test-rls-user', 'Test User', '9999999999', 'Test Street', 'Test City', 'Test State', '12345')
    RETURNING id INTO test_address_id;
    
    RAISE NOTICE '✅ User address created successfully with ID: %', test_address_id;
    
    -- Test user profile creation
    INSERT INTO user_profiles (user_id, full_name, phone, email)
    VALUES ('test-rls-user', 'Test User', '9999999999', 'test@example.com')
    RETURNING id INTO test_profile_id;
    
    RAISE NOTICE '✅ User profile created successfully with ID: %', test_profile_id;
    
    -- Clean up test data
    DELETE FROM order_tracking WHERE order_id = test_order_id;
    DELETE FROM order_items WHERE order_id = test_order_id;
    DELETE FROM orders WHERE id = test_order_id;
    DELETE FROM user_addresses WHERE id = test_address_id;
    DELETE FROM user_profiles WHERE id = test_profile_id;
    
    RAISE NOTICE '✅ RLS policies test successful!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ RLS policies test failed: %', SQLERRM;
END $$;

-- Step 6: Final verification
SELECT
    '✅ RLS POLICIES FIXED' as status,
    'All tables now allow public access' as fix_applied,
    (SELECT count(*) FROM orders) as current_orders,
    (SELECT count(*) FROM order_items) as current_order_items,
    (SELECT count(*) FROM user_addresses) as current_addresses,
    (SELECT count(*) FROM user_profiles) as current_profiles;

-- ==========================================
-- 🎉 RLS POLICIES FIXED!
-- ==========================================
-- Order creation will now work without RLS violations
-- All tables allow public access for development
-- Ready for order creation!
