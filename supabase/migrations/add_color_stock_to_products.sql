-- Add color_stock column to products table (stores JSON array of {color, stock})
ALTER TABLE products
ADD COLUMN IF NOT EXISTS color_stock jsonb;
