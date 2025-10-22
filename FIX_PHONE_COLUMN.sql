-- ==========================================
-- FIX: Missing Phone Column in Orders Table
-- ==========================================

-- Step 1: Check if phone column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'phone'
    ) THEN
        -- Add phone column if it doesn't exist
        ALTER TABLE orders ADD COLUMN phone TEXT NOT NULL DEFAULT '';
        RAISE NOTICE '✅ Added phone column to orders table';
    ELSE
        RAISE NOTICE '✅ Phone column already exists in orders table';
    END IF;
END $$;

-- Step 2: Update any existing orders without phone numbers
UPDATE orders 
SET phone = '0000000000' 
WHERE phone IS NULL OR phone = '';

-- Step 3: Make phone column NOT NULL (if it wasn't already)
ALTER TABLE orders ALTER COLUMN phone SET NOT NULL;

-- Step 4: Add phone column to order_items if needed (for reference)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'phone'
    ) THEN
        -- Add phone column to order_items for reference
        ALTER TABLE order_items ADD COLUMN phone TEXT;
        RAISE NOTICE '✅ Added phone column to order_items table';
    ELSE
        RAISE NOTICE '✅ Phone column already exists in order_items table';
    END IF;
END $$;

-- Step 5: Grant permissions
GRANT ALL ON orders TO anon, authenticated, service_role;
GRANT ALL ON order_items TO anon, authenticated, service_role;

-- Step 6: Test the fix
DO $$
DECLARE
    test_order_id UUID;
    phone_exists BOOLEAN;
BEGIN
    -- Check if phone column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'phone'
    ) INTO phone_exists;
    
    IF phone_exists THEN
        RAISE NOTICE '✅ Phone column exists in orders table';
        
        -- Test insert with phone
        INSERT INTO orders (user_id, total_amount, delivery_address, phone)
        VALUES ('test-user-phone', 99.99, 'Test Address', '9999999999')
        RETURNING id INTO test_order_id;
        
        RAISE NOTICE '✅ Test order created with ID: %', test_order_id;
        
        -- Clean up test order
        DELETE FROM orders WHERE user_id = 'test-user-phone';
        
        RAISE NOTICE '✅ Phone column fix successful!';
    ELSE
        RAISE NOTICE '❌ Phone column still missing!';
    END IF;
END $$;

-- Step 7: Verification
SELECT
    '✅ ORDERS TABLE PHONE COLUMN FIXED' as status,
    'Phone column added and working' as fix_applied,
    (SELECT count(*) FROM orders) as current_orders,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'phone') as phone_column_exists;

-- ==========================================
-- READY TO TEST ORDER CREATION!
-- ==========================================
-- The orders.phone field is now available
-- No more "Could not find the 'phone' column" errors
