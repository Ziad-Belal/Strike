-- Change stock tracking from color-based to size-based
-- Add size_stock column to products table (stores JSON array of {size, stock})
ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_stock jsonb;

-- Drop the old color_stock column if it exists
ALTER TABLE products
DROP COLUMN IF EXISTS color_stock;
