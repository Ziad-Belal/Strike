-- Create promo_codes table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_usages INTEGER,
  current_usages INTEGER DEFAULT 0,
  expiration_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Optional: Add RLS policies if needed
-- ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated users to read promo codes" ON promo_codes FOR SELECT USING (auth.role() = 'authenticated');