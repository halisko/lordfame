-- Step 1: Add new enum values (these need to be committed first)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'chief';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'moderator';  
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator';