-- Add Xyriel as owner by email
-- This script updates the user with email justinwalkensty@gmail.com to owner role

UPDATE users 
SET role = 'owner', 
    balance = GREATEST(balance, 3000000)  -- Ensure at least 3M chips
WHERE email = 'justinwalkensty@gmail.com';

-- Verify the update
SELECT id, uid, username, email, role, balance 
FROM users 
WHERE email = 'justinwalkensty@gmail.com';
