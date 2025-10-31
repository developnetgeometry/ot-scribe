-- Create positions table
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique position titles within each department
  CONSTRAINT unique_position_per_department UNIQUE (department_id, title)
);

-- Index for faster queries
CREATE INDEX idx_positions_department_id ON positions(department_id);
CREATE INDEX idx_positions_active ON positions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "pos_read" ON public.positions
  FOR SELECT USING (true);

CREATE POLICY "pos_hr_admin" ON public.positions
  FOR ALL USING (
    has_role(auth.uid(), 'hr'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Trigger for updated_at
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add position_id to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN position_id UUID REFERENCES positions(id) ON DELETE SET NULL;

-- Create index for profiles.position_id
CREATE INDEX idx_profiles_position_id ON profiles(position_id);

-- Migrate existing position text data to positions table
INSERT INTO positions (department_id, title, created_at)
SELECT DISTINCT 
  p.department_id,
  p.position,
  now()
FROM profiles p
WHERE p.position IS NOT NULL 
  AND p.position != ''
  AND p.department_id IS NOT NULL
ON CONFLICT (department_id, title) DO NOTHING;

-- Update profiles to use position_id
UPDATE profiles p
SET position_id = pos.id
FROM positions pos
WHERE p.department_id = pos.department_id
  AND p.position = pos.title
  AND p.position_id IS NULL;