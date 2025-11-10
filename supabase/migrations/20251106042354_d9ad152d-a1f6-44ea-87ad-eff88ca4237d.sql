-- Add ORP and HRP definition columns to ot_rate_formulas table
ALTER TABLE ot_rate_formulas 
ADD COLUMN orp_definition TEXT DEFAULT '(Basic / 26 / 8)',
ADD COLUMN hrp_definition TEXT DEFAULT '(Basic / 26 / 8)';

-- Ensure existing records have the default values
UPDATE ot_rate_formulas 
SET orp_definition = '(Basic / 26 / 8)', 
    hrp_definition = '(Basic / 26 / 8)'
WHERE orp_definition IS NULL OR hrp_definition IS NULL;