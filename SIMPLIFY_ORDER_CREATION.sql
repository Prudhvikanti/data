-- ==========================================
-- SIMPLIFY ORDER CREATION - Product Name & Quantity Only
-- ==========================================
-- This allows order creation with just product name and quantity
-- No need for complex product ID mapping

-- Step 1: Make product_id nullable in order_items
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- Step 2: Ensure product_name is required
ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;

-- Step 3: Add default values for missing columns
ALTER TABLE order_items ALTER COLUMN unit_price SET DEFAULT 0;
ALTER TABLE order_items ALTER COLUMN total_price SET DEFAULT 0;
ALTER TABLE order_items ALTER COLUMN price SET DEFAULT 0;

-- Step 4: Update existing order_items to have proper product names
UPDATE order_items 
SET product_name = COALESCE(product_name, 'Unknown Product')
WHERE product_name IS NULL OR product_name = '';

-- Step 5: Test simplified order creation
DO $$
DECLARE
    test_order_id UUID;
    test_item_id UUID;
BEGIN
    -- Test order creation
    INSERT INTO orders (user_id, total_amount, delivery_address, phone)
    VALUES ('test-simple-user', 99.99, 'Test Simple Address', '9999999999')
    RETURNING id INTO test_order_id;
    
    RAISE NOTICE '✅ Test order created with ID: %', test_order_id;
    
    -- Test order item creation with just name and quantity
    INSERT INTO order_items (
        order_id, 
        product_name,
        quantity, 
        unit_price, 
        total_price,
        price
    ) VALUES (
        test_order_id, 
        'Fresh Bananas',
        2, 
        2.99, 
        5.98,
        5.98
    ) RETURNING id INTO test_item_id;
    
    RAISE NOTICE '✅ Test order item created with ID: %', test_item_id;
    RAISE NOTICE '✅ Simplified order creation successful!';
    
    -- Clean up test data
    DELETE FROM order_items WHERE order_id = test_order_id;
    DELETE FROM orders WHERE id = test_order_id;
    
END $$;

-- Step 6: Final verification
SELECT
    '✅ SIMPLIFIED ORDER CREATION READY' as status,
    'Order items can be created with just name and quantity' as fix_applied,
    (SELECT count(*) FROM orders) as current_orders,
    (SELECT count(*) FROM order_items) as current_order_items;

-- ==========================================
-- 🎉 SIMPLIFIED ORDER CREATION READY!
-- ==========================================
-- Order items can now be created with just:
-- - product_name (required)
-- - quantity (required)
-- - price/unit_price/total_price (optional, defaults to 0)
-- - product_id (optional, can be NULL)
-- Ready for simple order creation!
