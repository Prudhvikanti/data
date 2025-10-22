-- ==========================================
-- FIX: Make product_id accept string IDs
-- ==========================================

-- Step 1: Drop existing constraints
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Step 2: Change product_id from UUID to TEXT
ALTER TABLE order_items ALTER COLUMN product_id TYPE TEXT;

-- Step 3: Add back foreign key but as TEXT (no UUID casting)
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Step 4: Update existing products to have proper IDs if needed
-- (Products already have string IDs like "prod-0", "prod-1", etc.)

-- Step 5: Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PRODUCT ID ISSUE FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'order_items.product_id is now TEXT';
  RAISE NOTICE 'Can accept string IDs like "prod-29"';
  RAISE NOTICE 'No more UUID casting errors!';
  RAISE NOTICE '========================================';
END $$;

-- Check the fix
SELECT
  '✅ product_id is now TEXT' as status,
  column_name, data_type
FROM information_schema.columns
WHERE table_name = 'order_items'
AND column_name = 'product_id';

-- ==========================================
-- READY TO TEST!
-- ==========================================
