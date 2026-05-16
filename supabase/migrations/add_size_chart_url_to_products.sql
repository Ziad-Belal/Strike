-- Add size_chart_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_chart_url TEXT;
