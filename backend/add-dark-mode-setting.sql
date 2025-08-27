-- Add dark mode setting to user_settings
-- Run this in TablePlus to add dark mode support

-- Add dark mode setting for existing users (default to light mode)
INSERT INTO user_settings (user_id, setting_key, setting_value)
SELECT users.id, 'dark_mode', 'false'::jsonb
FROM users 
ON CONFLICT (user_id, setting_key) DO NOTHING;

-- For our test user, let's set it to false initially
INSERT INTO user_settings (user_id, setting_key, setting_value)
SELECT users.id, 'dark_mode', 'false'::jsonb
FROM users WHERE email = 'test@example.com'
ON CONFLICT (user_id, setting_key) DO UPDATE SET setting_value = 'false'::jsonb;

SELECT 'Dark mode setting added to user_settings!' as status;
SELECT 'Users can now toggle dark mode in the app' as info;