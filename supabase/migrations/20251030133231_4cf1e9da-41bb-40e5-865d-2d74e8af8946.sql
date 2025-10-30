-- Create activation_tokens table
CREATE TABLE IF NOT EXISTS public.activation_tokens (
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

-- RLS Policies (only service role and HR can manage tokens)
CREATE POLICY "act_hr_read" ON public.activation_tokens
  FOR SELECT
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "act_public_validate" ON public.activation_tokens
  FOR SELECT
  USING (status = 'pending' AND expires_at > now());

-- Function to mark expired tokens
CREATE OR REPLACE FUNCTION public.mark_expired_tokens()
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