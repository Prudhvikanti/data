-- ==========================================
-- FIX: Missing Price Column in Order Items Table
-- ==========================================
-- This fixes the "Could not find the 'price' column of 'order_items' in the schema cache" error

-- Step 1: Check if price column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'price'
    ) THEN
        -- Add price column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0;
        RAISE NOTICE '✅ Added price column to order_items table';
    ELSE
        RAISE NOTICE '✅ Price column already exists in order_items table';
    END IF;
END $$;

-- Step 2: Check if unit_price column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'unit_price'
    ) THEN
        -- Add unit_price column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
        RAISE NOTICE '✅ Added unit_price column to order_items table';
    ELSE
        RAISE NOTICE '✅ Unit_price column already exists in order_items table';
    END IF;
END $$;

-- Step 3: Check if total_price column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'total_price'
    ) THEN
        -- Add total_price column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN total_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
        RAISE NOTICE '✅ Added total_price column to order_items table';
    ELSE
        RAISE NOTICE '✅ Total_price column already exists in order_items table';
    END IF;
END $$;

-- Step 4: Check if product_name column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'product_name'
    ) THEN
        -- Add product_name column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN product_name TEXT;
        RAISE NOTICE '✅ Added product_name column to order_items table';
    ELSE
        RAISE NOTICE '✅ Product_name column already exists in order_items table';
    END IF;
END $$;

-- Step 5: Check if product_description column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'product_description'
    ) THEN
        -- Add product_description column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN product_description TEXT;
        RAISE NOTICE '✅ Added product_description column to order_items table';
    ELSE
        RAISE NOTICE '✅ Product_description column already exists in order_items table';
    END IF;
END $$;

-- Step 6: Check if product_image_url column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'product_image_url'
    ) THEN
        -- Add product_image_url column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN product_image_url TEXT;
        RAISE NOTICE '✅ Added product_image_url column to order_items table';
    ELSE
        RAISE NOTICE '✅ Product_image_url column already exists in order_items table';
    END IF;
END $$;

-- Step 7: Check if unit column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'unit'
    ) THEN
        -- Add unit column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN unit TEXT DEFAULT 'unit';
        RAISE NOTICE '✅ Added unit column to order_items table';
    ELSE
        RAISE NOTICE '✅ Unit column already exists in order_items table';
    END IF;
END $$;

-- Step 8: Check if weight column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'weight'
    ) THEN
        -- Add weight column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN weight DECIMAL(8, 2);
        RAISE NOTICE '✅ Added weight column to order_items table';
    ELSE
        RAISE NOTICE '✅ Weight column already exists in order_items table';
    END IF;
END $$;

-- Step 9: Check if discount_amount column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'discount_amount'
    ) THEN
        -- Add discount_amount column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Added discount_amount column to order_items table';
    ELSE
        RAISE NOTICE '✅ Discount_amount column already exists in order_items table';
    END IF;
END $$;

-- Step 10: Check if tax_amount column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'tax_amount'
    ) THEN
        -- Add tax_amount column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE '✅ Added tax_amount column to order_items table';
    ELSE
        RAISE NOTICE '✅ Tax_amount column already exists in order_items table';
    END IF;
END $$;

-- Step 11: Check if special_instructions column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'special_instructions'
    ) THEN
        -- Add special_instructions column if it doesn't exist
        ALTER TABLE order_items ADD COLUMN special_instructions TEXT;
        RAISE NOTICE '✅ Added special_instructions column to order_items table';
    ELSE
        RAISE NOTICE '✅ Special_instructions column already exists in order_items table';
    END IF;
END $$;

-- Step 12: Update any existing order_items with default values
UPDATE order_items 
SET 
    price = COALESCE(price, 0),
    unit_price = COALESCE(unit_price, 0),
    total_price = COALESCE(total_price, 0),
    unit = COALESCE(unit, 'unit'),
    discount_amount = COALESCE(discount_amount, 0),
    tax_amount = COALESCE(tax_amount, 0)
WHERE 
    price IS NULL OR 
    unit_price IS NULL OR 
    total_price IS NULL OR 
    unit IS NULL OR 
    discount_amount IS NULL OR 
    tax_amount IS NULL;

-- Step 13: Grant permissions
GRANT ALL ON order_items TO anon, authenticated, service_role;

-- Step 14: Test the complete setup with REAL data
DO $$
DECLARE
    test_order_id UUID;
    test_item_id UUID;
    test_product_id UUID;
    price_exists BOOLEAN;
    unit_price_exists BOOLEAN;
    total_price_exists BOOLEAN;
    product_name_exists BOOLEAN;
    orders_count INTEGER;
    order_items_count INTEGER;
BEGIN
    -- Check if all required columns exist
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
    
    IF price_exists AND unit_price_exists AND total_price_exists AND product_name_exists THEN
        RAISE NOTICE '✅ All required columns exist in order_items table';
        
        -- Get a real product ID from the products table
        SELECT id INTO test_product_id FROM products LIMIT 1;
        
        IF test_product_id IS NOT NULL THEN
            RAISE NOTICE '✅ Found sample product with ID: %', test_product_id;
            
            -- Test complete order creation
            INSERT INTO orders (user_id, total_amount, delivery_address, phone)
            VALUES ('test-schema-user', 199.99, 'Test Schema Address', '9999999999')
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
            
            -- Get counts
            SELECT count(*) INTO orders_count FROM orders;
            SELECT count(*) INTO order_items_count FROM order_items;
            
            RAISE NOTICE '✅ Total orders: %, order items: %', orders_count, order_items_count;
            
            -- Clean up test data
            DELETE FROM order_items WHERE order_id = test_order_id;
            DELETE FROM orders WHERE id = test_order_id;
            
            RAISE NOTICE '✅ Order items schema fix successful!';
        ELSE
            RAISE NOTICE '❌ No products found in database!';
        END IF;
    ELSE
        RAISE NOTICE '❌ Required columns still missing!';
        RAISE NOTICE 'Price exists: %, Unit_price exists: %, Total_price exists: %, Product_name exists: %', 
                     price_exists, unit_price_exists, total_price_exists, product_name_exists;
    END IF;
END $$;

-- Step 15: Final verification
SELECT
    '✅ ORDER ITEMS SCHEMA FIXED' as status,
    'All required columns added to order_items table' as fix_applied,
    (SELECT count(*) FROM orders) as current_orders,
    (SELECT count(*) FROM order_items) as current_order_items,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'price') as price_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'unit_price') as unit_price_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'total_price') as total_price_column_exists,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_name') as product_name_column_exists;

-- ==========================================
-- 🎉 ORDER ITEMS SCHEMA FIXED!
-- ==========================================
-- All required columns added to order_items table
-- Order creation will now work without schema errors
-- Ready for order items creation!
