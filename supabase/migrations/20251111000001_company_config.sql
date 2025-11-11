-- Migration: Company Configuration for Malaysian Holiday Management
-- Story: 7-1-malaysian-state-configuration
-- Description: Create company_config table for storing company-specific holiday settings
-- Author: BMAD Dev Agent
-- Date: 2025-11-11

-- Create company_config table
CREATE TABLE IF NOT EXISTS company_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_state TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one configuration per company
  CONSTRAINT unique_company_config UNIQUE (company_id),

  -- Validate state selection (16 Malaysian states using standard codes)
  CONSTRAINT valid_state_selection CHECK (
    selected_state IN (
      'JHR', 'KDH', 'KTN', 'MLK', 'NSN',
      'PHG', 'PNG', 'PRK', 'PLS', 'SBH',
      'SWK', 'SGR', 'TRG', 'WPKL', 'WPPJ', 'WPLB'
    )
  )
);

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_company_config_company_id
  ON company_config(company_id);

-- Enable Row Level Security
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own company configuration
CREATE POLICY "Users can manage own company config"
  ON company_config
  FOR ALL
  USING (auth.uid() = company_id)
  WITH CHECK (auth.uid() = company_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_company_config_updated_at
  BEFORE UPDATE ON company_config
  FOR EACH ROW
  EXECUTE FUNCTION update_company_config_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON company_config TO authenticated;

-- Add helpful comment
COMMENT ON TABLE company_config IS 'Stores company-specific configuration for Malaysian holiday calendar management';
COMMENT ON COLUMN company_config.selected_state IS 'Malaysian state code (e.g., SGR, JHR, KTN) using 3-letter abbreviations for state-specific holiday data';
COMMENT ON COLUMN company_config.company_id IS 'References auth.users(id) - one configuration per user/company';
