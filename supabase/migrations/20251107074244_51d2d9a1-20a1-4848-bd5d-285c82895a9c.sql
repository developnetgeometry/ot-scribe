-- Create table for inventory access tokens
CREATE TABLE inventory_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token uuid NOT NULL UNIQUE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for quick lookup
CREATE INDEX idx_inventory_tokens_user ON inventory_access_tokens(user_id);
CREATE INDEX idx_inventory_tokens_token ON inventory_access_tokens(token);
CREATE INDEX idx_inventory_tokens_active ON inventory_access_tokens(is_active, expires_at);

-- Enable Row Level Security
ALTER TABLE inventory_access_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own tokens
CREATE POLICY "Users can view their own tokens"
  ON inventory_access_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own tokens
CREATE POLICY "Users can insert their own tokens"
  ON inventory_access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);