-- QuickCommerce Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  unit TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (Public Read)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- RLS Policies for Products (Public Read)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- RLS Policies for Orders (User specific)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Order Items (User specific through orders)
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Insert Sample Categories
INSERT INTO categories (name, emoji) VALUES
  ('Fruits & Vegetables', '🥬'),
  ('Dairy & Eggs', '🥛'),
  ('Beverages', '🥤'),
  ('Snacks', '🍿'),
  ('Bakery', '🍞'),
  ('Personal Care', '🧴');

-- Insert Sample Products
INSERT INTO products (category_id, name, description, price, original_price, unit, featured, image_url) VALUES
  -- Fruits & Vegetables
  (
    (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' LIMIT 1),
    'Fresh Bananas',
    'Fresh organic bananas, rich in potassium and perfect for a healthy snack. These premium bananas are hand-picked at peak ripeness to ensure the best flavor and nutrition. Great for smoothies, baking, or eating on-the-go.',
    2.99,
    3.99,
    '1 dozen',
    true,
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' LIMIT 1),
    'Red Apples',
    'Crisp and sweet red apples, great for snacking or baking. These juicy apples are grown in organic orchards and are packed with vitamins and fiber. Perfect for apple pie, salads, or eating fresh.',
    4.49,
    5.99,
    '1 lb',
    true,
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' LIMIT 1),
    'Fresh Tomatoes',
    'Vine-ripened tomatoes bursting with flavor. Grown locally and harvested at peak freshness. Perfect for salads, sandwiches, pasta sauce, or roasting. Rich in lycopene and vitamin C.',
    3.99,
    4.99,
    '1 lb',
    true,
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' LIMIT 1),
    'Baby Carrots',
    'Sweet and crunchy baby carrots, pre-washed and ready to eat. Perfect for snacking, dipping, or adding to lunchboxes. High in beta-carotene and vitamin A. Great with hummus or ranch dressing.',
    2.49,
    2.99,
    '1 lb bag',
    false,
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' LIMIT 1),
    'Fresh Strawberries',
    'Juicy, sweet strawberries handpicked at the peak of freshness. These berries are perfect for desserts, smoothies, or eating fresh. Rich in antioxidants and vitamin C. Locally grown when in season.',
    5.99,
    7.49,
    '1 pint',
    true,
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&h=500&fit=crop'
  ),
  
  -- Dairy & Eggs
  (
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'Whole Milk',
    'Fresh whole milk from local dairy farms, perfect for your morning cereal or coffee. Pasteurized and homogenized for quality and safety. Rich in calcium, protein, and vitamin D. Grade A quality guaranteed.',
    3.99,
    4.49,
    '1 gallon',
    true,
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'Farm Fresh Eggs',
    'Organic farm fresh eggs from cage-free hens, packed with protein and nutrients. Large grade AA eggs with bright yellow yolks. Perfect for baking, breakfast, or hard-boiling. High in protein and healthy fats.',
    5.99,
    6.99,
    '12 count',
    true,
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'Greek Yogurt',
    'Creamy Greek yogurt with live and active cultures. High in protein and probiotics for digestive health. Made from premium milk with no artificial flavors. Perfect for breakfast bowls, smoothies, or as a healthy snack.',
    4.99,
    5.99,
    '32 oz',
    true,
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs' LIMIT 1),
    'Cheddar Cheese',
    'Sharp aged cheddar cheese, perfect for sandwiches, burgers, or cheese boards. Made from high-quality milk and aged to perfection. Rich, bold flavor that melts beautifully. Pre-sliced for convenience.',
    6.49,
    7.99,
    '8 oz',
    false,
    'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500&h=500&fit=crop'
  ),
  
  -- Beverages
  (
    (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1),
    'Orange Juice',
    '100% pure orange juice with no added sugars or preservatives, freshly squeezed every morning. Made from premium Florida oranges. Rich in vitamin C and antioxidants. Not from concentrate for the freshest taste.',
    6.99,
    7.99,
    '64 oz',
    true,
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1),
    'Sparkling Water',
    'Refreshing sparkling water with natural flavors. Zero calories, zero sugar, just pure refreshment. Available in multiple flavors. Perfect alternative to sugary sodas. Eco-friendly recyclable packaging.',
    4.99,
    5.99,
    '12 pack',
    false,
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1),
    'Green Tea',
    'Premium green tea bags with natural antioxidants. Smooth, refreshing taste with no bitterness. Each box contains 20 individually wrapped tea bags. Rich in polyphenols and perfect for hot or iced tea.',
    5.49,
    6.99,
    '20 bags',
    true,
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1),
    'Cold Brew Coffee',
    'Smooth and rich cold brew coffee concentrate. Just add water or milk for the perfect cup. Made from premium arabica beans. Low acidity and naturally sweet. Makes 8-10 servings.',
    8.99,
    10.99,
    '32 oz',
    true,
    'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop'
  ),
  
  -- Snacks
  (
    (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1),
    'Potato Chips',
    'Crispy and delicious potato chips made from premium potatoes. Available in various flavors including sea salt, BBQ, and sour cream. Perfectly seasoned and kettle-cooked for extra crunch. Great for parties or snacking.',
    3.49,
    4.49,
    '10 oz',
    true,
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1),
    'Mixed Nuts',
    'Premium mixed nuts including almonds, cashews, walnuts, and pecans. Lightly salted and roasted to perfection. High in protein and healthy fats. Perfect for snacking or adding to salads and trail mix.',
    7.99,
    9.99,
    '12 oz',
    true,
    'https://images.unsplash.com/photo-1599599810694-e9ea4a5a4805?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1),
    'Granola Bars',
    'Wholesome granola bars made with oats, honey, and real fruit. Perfect for on-the-go breakfast or snacking. No artificial flavors or preservatives. Each box contains 12 individually wrapped bars.',
    5.99,
    6.99,
    '12 bars',
    false,
    'https://images.unsplash.com/photo-1590080876314-181ff7f89c5c?w=500&h=500&fit=crop'
  ),
  
  -- Bakery
  (
    (SELECT id FROM categories WHERE name = 'Bakery' LIMIT 1),
    'Whole Wheat Bread',
    'Soft and fresh whole wheat bread baked daily, perfect for sandwiches and toast. Made with 100% whole wheat flour and no high fructose corn syrup. High in fiber and nutrients. Stays fresh for days.',
    2.99,
    3.49,
    '20 oz loaf',
    true,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Bakery' LIMIT 1),
    'Croissants',
    'Buttery, flaky croissants baked fresh daily. Made with premium butter and flour for authentic French taste. Perfect for breakfast or afternoon snack. Each pack contains 6 croissants.',
    6.99,
    8.49,
    '6 pack',
    true,
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Bakery' LIMIT 1),
    'Chocolate Chip Cookies',
    'Fresh-baked chocolate chip cookies with premium chocolate chunks. Soft and chewy texture with a rich buttery flavor. Made with real butter and vanilla. Perfect for dessert or snacking.',
    4.99,
    5.99,
    '12 cookies',
    false,
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&h=500&fit=crop'
  ),
  
  -- Personal Care
  (
    (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1),
    'Hand Soap',
    'Moisturizing hand soap with natural ingredients and essential oils. Gentle formula that cleanses without drying. Available in refreshing scents like lavender, citrus, and mint. Pump bottle for easy dispensing.',
    3.99,
    4.99,
    '12 oz',
    false,
    'https://images.unsplash.com/photo-1585933646377-48b489935e41?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1),
    'Shampoo & Conditioner',
    'Professional quality shampoo and conditioner set for all hair types. Sulfate-free formula with natural oils and proteins. Leaves hair soft, shiny, and manageable. Fresh scent that lasts all day.',
    12.99,
    15.99,
    '16 oz each',
    true,
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&h=500&fit=crop'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Personal Care' LIMIT 1),
    'Toothpaste',
    'Fluoride toothpaste for complete oral care. Whitening formula that fights cavities and strengthens enamel. Fresh mint flavor for long-lasting freshness. Dentist recommended. Family-size tube.',
    4.49,
    5.49,
    '6 oz',
    false,
    'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=500&h=500&fit=crop'
  );

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

