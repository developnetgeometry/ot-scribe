-- Migration: Create holiday_overrides table for manual holiday management
-- Story: 7-3-manual-holiday-override-system
-- Date: 2025-11-11
-- Purpose: Allow HR administrators to manually add, modify, or remove holidays

-- Create holiday_overrides table for storing manually added/modified holidays
CREATE TABLE IF NOT EXISTS holiday_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('company', 'emergency', 'government')) NOT NULL DEFAULT 'company',
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate overrides for same company and date
  CONSTRAINT unique_company_date UNIQUE (company_id, date)
);

-- Add table comment
COMMENT ON TABLE holiday_overrides IS 'Stores manually added/overridden holidays by HR administrators with full audit trail';

-- Add column comments
COMMENT ON COLUMN holiday_overrides.company_id IS 'Company/user ID that owns this holiday override';
COMMENT ON COLUMN holiday_overrides.date IS 'The date of the holiday override';
COMMENT ON COLUMN holiday_overrides.name IS 'Name of the holiday';
COMMENT ON COLUMN holiday_overrides.type IS 'Override type: company (company-specific), emergency (emergency closure), or government (last-minute government change)';
COMMENT ON COLUMN holiday_overrides.description IS 'Optional additional details about the holiday';
COMMENT ON COLUMN holiday_overrides.created_by IS 'User ID of the administrator who created this override';
COMMENT ON COLUMN holiday_overrides.created_at IS 'Timestamp when the override was created';
COMMENT ON COLUMN holiday_overrides.updated_at IS 'Timestamp when the override was last updated';

-- Performance indexes
-- Primary index for querying overrides by company and date
CREATE INDEX idx_overrides_company_date ON holiday_overrides(company_id, date);

-- Index for querying by date (useful for upcoming holiday checks)
CREATE INDEX idx_overrides_date ON holiday_overrides(date);

-- Index for audit trail queries (who created what)
CREATE INDEX idx_overrides_created_by ON holiday_overrides(created_by);

-- Index for filtering by type
CREATE INDEX idx_overrides_type ON holiday_overrides(type);

-- Enable Row Level Security
ALTER TABLE holiday_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own company's holiday overrides
CREATE POLICY "Users can view own company holiday overrides"
  ON holiday_overrides
  FOR SELECT
  USING (auth.uid() = company_id);

-- RLS Policy: Users can insert holiday overrides for their own company
CREATE POLICY "Users can create own company holiday overrides"
  ON holiday_overrides
  FOR INSERT
  WITH CHECK (auth.uid() = company_id AND auth.uid() = created_by);

-- RLS Policy: Users can update their own company's holiday overrides
CREATE POLICY "Users can update own company holiday overrides"
  ON holiday_overrides
  FOR UPDATE
  USING (auth.uid() = company_id);

-- RLS Policy: Users can delete their own company's holiday overrides
CREATE POLICY "Users can delete own company holiday overrides"
  ON holiday_overrides
  FOR DELETE
  USING (auth.uid() = company_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_holiday_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_holiday_overrides_updated_at_trigger
  BEFORE UPDATE ON holiday_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_holiday_overrides_updated_at();

-- Insert sample override data for testing (optional - can be removed in production)
-- Note: These will fail if no auth.users exist yet, which is expected
-- These are commented out to avoid errors during migration
/*
INSERT INTO holiday_overrides (company_id, date, name, type, description, created_by) VALUES
  ((SELECT id FROM auth.users LIMIT 1), '2025-03-15', 'Company Founder Day', 'company', 'Annual company celebration', (SELECT id FROM auth.users LIMIT 1)),
  ((SELECT id FROM auth.users LIMIT 1), '2025-06-20', 'Mid-Year Retreat', 'company', 'All-hands company retreat', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (company_id, date) DO NOTHING;
*/
