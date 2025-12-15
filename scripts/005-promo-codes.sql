-- Create promo codes table (if not exists, use bonus_chips column to match existing schema)
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  bonus_chips INTEGER NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create code redemptions table to track who redeemed what (matching existing schema)
CREATE TABLE IF NOT EXISTS code_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  promo_code_id INTEGER REFERENCES promo_codes(id) ON DELETE CASCADE,
  chips_awarded INTEGER DEFAULT 0,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, promo_code_id)
);

-- Insert default XMAS2025 promo code (expires January 1, 2026)
INSERT INTO promo_codes (code, bonus_chips, discount_percent, max_uses, expires_at, is_active)
VALUES ('XMAS2025', 100, 20, NULL, '2026-01-01 00:00:00+00', true)
ON CONFLICT (code) DO NOTHING;
