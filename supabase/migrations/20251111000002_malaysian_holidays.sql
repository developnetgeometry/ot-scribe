-- Migration: Create malaysian_holidays table for web-scraped holiday data
-- Story: 7-2-web-scraping-holiday-engine
-- Date: 2025-11-11

-- Create malaysian_holidays table for storing scraped holiday data
CREATE TABLE IF NOT EXISTS malaysian_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  type TEXT CHECK (type IN ('federal', 'state', 'religious')) NOT NULL,
  source TEXT NOT NULL,
  year INTEGER NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE malaysian_holidays IS 'Stores Malaysian public holidays scraped from various web sources';

-- Add column comments
COMMENT ON COLUMN malaysian_holidays.date IS 'The date of the holiday';
COMMENT ON COLUMN malaysian_holidays.name IS 'Name of the holiday';
COMMENT ON COLUMN malaysian_holidays.state IS 'Malaysian state code (e.g., "KUL", "JHR") or "ALL" for federal holidays';
COMMENT ON COLUMN malaysian_holidays.type IS 'Holiday type: federal (nationwide), state (specific state), or religious';
COMMENT ON COLUMN malaysian_holidays.source IS 'Source URL from which the holiday was scraped';
COMMENT ON COLUMN malaysian_holidays.year IS 'Year of the holiday for efficient querying';
COMMENT ON COLUMN malaysian_holidays.scraped_at IS 'Timestamp when the holiday was scraped from the source';

-- Performance indexes
-- Primary index for querying holidays by state and year
CREATE INDEX idx_holidays_state_year ON malaysian_holidays(state, year);

-- Index for querying holidays by date (useful for checking upcoming holidays)
CREATE INDEX idx_holidays_date ON malaysian_holidays(date);

-- Index for querying by type (federal, state, religious)
CREATE INDEX idx_holidays_type ON malaysian_holidays(type);

-- Unique index to prevent duplicate holidays (same state, date, year, and name)
-- This handles deduplication at the database level
CREATE UNIQUE INDEX idx_holidays_unique ON malaysian_holidays(state, date, year, name);

-- Enable Row Level Security
ALTER TABLE malaysian_holidays ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access for all authenticated and anonymous users
-- Holiday data is public information and should be accessible to everyone
CREATE POLICY "Public holidays are viewable by all users"
  ON malaysian_holidays
  FOR SELECT
  USING (true);

-- RLS Policy: Only service role can insert/update/delete holidays
-- This ensures only the scraping Edge Function can modify holiday data
CREATE POLICY "Only service role can modify holidays"
  ON malaysian_holidays
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_malaysian_holidays_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_malaysian_holidays_updated_at_trigger
  BEFORE UPDATE ON malaysian_holidays
  FOR EACH ROW
  EXECUTE FUNCTION update_malaysian_holidays_updated_at();

-- Insert sample data for testing (optional - can be removed in production)
-- This helps verify the schema works correctly
INSERT INTO malaysian_holidays (date, name, state, type, source, year) VALUES
  ('2025-01-01', 'New Year''s Day', 'ALL', 'federal', 'officeholidays.com', 2025),
  ('2025-05-01', 'Labour Day', 'ALL', 'federal', 'officeholidays.com', 2025),
  ('2025-08-31', 'National Day', 'ALL', 'federal', 'officeholidays.com', 2025),
  ('2025-09-16', 'Malaysia Day', 'ALL', 'federal', 'officeholidays.com', 2025)
ON CONFLICT (state, date, year, name) DO NOTHING;
