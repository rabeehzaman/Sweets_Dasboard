-- Script to set Arabic as default language for Osaimi user
--
-- INSTRUCTIONS:
-- 1. First, find the Osaimi user's ID by checking which user has access to "Osaimi Van" branch
-- 2. Then update their preferred_language to 'ar'

-- Step 1: View all users and their branch permissions
SELECT
  user_id,
  allowed_branches,
  role,
  preferred_language
FROM user_branch_permissions;

-- Step 2: Update the Osaimi user's language preference
-- Replace 'USER_ID_HERE' with the actual user_id from Step 1
-- (The user who has 'Osaimi Van' in their allowed_branches)

-- Example (uncomment and modify):
-- UPDATE user_branch_permissions
-- SET preferred_language = 'ar'
-- WHERE user_id = 'USER_ID_HERE';

-- Step 3: Verify the update
-- SELECT user_id, allowed_branches, preferred_language
-- FROM user_branch_permissions
-- WHERE user_id = 'USER_ID_HERE';
