-- Migration: Create push_subscriptions table for future PWA push notification support
-- Story: 2-1-push-subscription-schema
-- Date: 2025-11-04
-- Description: Creates database schema for storing push notification subscriptions
--              (user_id, endpoint, keys) to support future notification delivery.
--              This is infrastructure-only in MVP - push notifications not yet activated.

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uq_push_subscriptions_user_endpoint UNIQUE(user_id, endpoint)
);

-- Add table comment for documentation
COMMENT ON TABLE public.push_subscriptions IS 'Stores push notification subscriptions for future PWA push notification feature (infrastructure only in MVP)';

-- Add column comments
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'Push notification endpoint URL from Web Push API subscription';
COMMENT ON COLUMN public.push_subscriptions.p256dh_key IS 'P256DH encryption key from Web Push API subscription.keys.p256dh';
COMMENT ON COLUMN public.push_subscriptions.auth_key IS 'Authentication secret from Web Push API subscription.keys.auth';
COMMENT ON COLUMN public.push_subscriptions.is_active IS 'Enables disabling subscriptions without deletion (GDPR-friendly)';

-- Enable Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at timestamp
-- Note: update_updated_at_column() function already exists from earlier migration
CREATE TRIGGER upd_push_subscriptions
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance optimization
CREATE INDEX idx_push_subscriptions_user_id
  ON public.push_subscriptions(user_id);

CREATE INDEX idx_push_subscriptions_active
  ON public.push_subscriptions(is_active)
  WHERE is_active = true;

-- Grant permissions (following existing pattern)
-- Note: RLS policies control access; these grants enable table access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT ON public.push_subscriptions TO anon;
