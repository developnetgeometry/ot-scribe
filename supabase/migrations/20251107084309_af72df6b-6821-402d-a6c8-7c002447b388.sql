-- Add column to control per-employee OT attachment requirement
ALTER TABLE profiles 
ADD COLUMN require_ot_attachment boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.require_ot_attachment IS 
  'When true, employee must attach files when submitting OT requests';