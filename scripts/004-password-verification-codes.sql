-- Password verification codes table
CREATE TABLE IF NOT EXISTS password_verification_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_password_codes_user_id ON password_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_codes_code ON password_verification_codes(code);
