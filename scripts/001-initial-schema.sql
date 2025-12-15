-- Users table with role-based access control
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  balance INTEGER DEFAULT 0,
  is_timed_out BOOLEAN DEFAULT false,
  timeout_until TIMESTAMP,
  timeout_by_admin_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- License keys table
CREATE TABLE IF NOT EXISTS license_keys (
  id SERIAL PRIMARY KEY,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expiry_date TIMESTAMP,
  is_lifetime BOOLEAN DEFAULT false,
  max_devices INTEGER NOT NULL,
  devices_used INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'deleted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device tracking table
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  license_key_id INTEGER NOT NULL REFERENCES license_keys(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_info TEXT,
  first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(license_key_id, device_id)
);

-- App updates table
CREATE TABLE IF NOT EXISTS app_updates (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  update_message TEXT NOT NULL,
  is_forced BOOLEAN DEFAULT true,
  created_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Balance transactions table
CREATE TABLE IF NOT EXISTS balance_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  note TEXT,
  created_by_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_license_keys_user_id ON license_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_license_keys_key ON license_keys(license_key);
CREATE INDEX IF NOT EXISTS idx_devices_license_key_id ON devices(license_key_id);
