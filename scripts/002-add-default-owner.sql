-- Add the specified user as owner
-- This will update the user with the given UID and email to have owner role

UPDATE users 
SET role = 'owner' 
WHERE uid = 'FSSFM4EVOYXK' 
  AND email = 'justinwalkensty@gmail.com';

-- If the user doesn't exist yet, this won't do anything
-- The user will need to register first, then this can be run
-- Or use the Owner Config page after they register
