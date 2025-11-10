-- Migration: Add notification_preferences column to profiles table
-- Story: 3-7-implement-notification-settings-preferences
-- Date: 2025-11-10
-- Description: Adds JSONB column to profiles table for storing user notification preferences

-- Add notification_preferences column with default values
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "ot_requests_new": true,
  "ot_requests_approved": true,
  "ot_requests_rejected": true,
  "all_disabled": false
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences for different types of push notifications';
