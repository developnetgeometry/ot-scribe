-- Drop existing objects if they exist
DROP INDEX IF EXISTS public.idx_activation_tokens_token;
DROP INDEX IF EXISTS public.idx_activation_tokens_employee;
DROP INDEX IF EXISTS public.idx_activation_tokens_status;
DROP POLICY IF EXISTS "act_hr_read" ON public.activation_tokens;
DROP POLICY IF EXISTS "act_public_validate" ON public.activation_tokens;
DROP FUNCTION IF EXISTS public.mark_expired_tokens();
DROP TABLE IF EXISTS public.activation_tokens;

-- Create activation_tokens table
CREATE TABLE public.activation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  email_result JSONB,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'expired'))
);

-- Create indexes for faster token lookups
CREATE INDEX idx_activation_tokens_token ON public.activation_tokens(token);
CREATE INDEX idx_activation_tokens_employee ON public.activation_tokens(employee_id);
CREATE INDEX idx_activation_tokens_status ON public.activation_tokens(status);

-- Enable RLS
ALTER TABLE public.activation_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "act_hr_read" ON public.activation_tokens
  FOR SELECT
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "act_public_validate" ON public.activation_tokens
  FOR SELECT
  USING (status = 'pending' AND expires_at > now());

-- Function to mark expired tokens
CREATE FUNCTION public.mark_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.activation_tokens
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at <= now();
END;
$$;