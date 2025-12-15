-- Add discord_id and discord_username columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_username VARCHAR(255);

-- Update the specific user to be owner with 3 million balance
UPDATE users 
SET 
  role = 'owner',
  balance = 3000000
WHERE uid = 'FSSFM4EVOYXK' 
  AND email = 'justinwalkensty@gmail.com';

-- If the user doesn't exist yet, this will be a no-op
-- The user will need to register first, then run this script
