-- Add resubmission tracking fields to ot_requests
ALTER TABLE public.ot_requests
ADD COLUMN IF NOT EXISTS parent_request_id uuid REFERENCES public.ot_requests(id),
ADD COLUMN IF NOT EXISTS resubmission_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rejection_stage text,
ADD COLUMN IF NOT EXISTS is_resubmission boolean DEFAULT false;

-- Create index for faster parent request queries
CREATE INDEX IF NOT EXISTS idx_parent_request ON public.ot_requests(parent_request_id);
CREATE INDEX IF NOT EXISTS idx_is_resubmission ON public.ot_requests(is_resubmission);

-- Add new status for HR recertification
ALTER TYPE public.ot_status ADD VALUE IF NOT EXISTS 'pending_hr_recertification';

-- Create resubmission history table
CREATE TABLE IF NOT EXISTS public.ot_resubmission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_request_id uuid NOT NULL REFERENCES public.ot_requests(id) ON DELETE CASCADE,
  resubmitted_request_id uuid NOT NULL REFERENCES public.ot_requests(id) ON DELETE CASCADE,
  rejected_by_role app_role NOT NULL,
  rejection_reason text NOT NULL,
  resubmitted_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on resubmission history
ALTER TABLE public.ot_resubmission_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own resubmission history
CREATE POLICY "Users can view own resubmission history"
ON public.ot_resubmission_history FOR SELECT
USING (
  original_request_id IN (
    SELECT id FROM public.ot_requests WHERE employee_id = auth.uid()
  )
);

-- RLS Policy: HR/Admin can view all resubmission history
CREATE POLICY "HR/Admin can view all resubmission history"
ON public.ot_resubmission_history FOR SELECT
USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: System can insert resubmission history
CREATE POLICY "System can insert resubmission history"
ON public.ot_resubmission_history FOR INSERT
WITH CHECK (true);

-- Update notification trigger function
CREATE OR REPLACE FUNCTION public.notify_ot_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  hr_users UUID[];
  bod_users UUID[];
  employee_id UUID;
  supervisor_id UUID;
BEGIN
  employee_id := NEW.employee_id;
  supervisor_id := NEW.supervisor_id;
  
  -- When supervisor verifies → notify HR
  IF NEW.status = 'supervisor_verified' AND OLD.status = 'pending_verification' THEN
    SELECT array_agg(user_id) INTO hr_users
    FROM user_roles WHERE role = 'hr';
    
    IF hr_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(hr_users), 
             'New OT Request for Approval',
             'A new OT request verified by Supervisor is ready for your review.',
             '/hr/approve',
             'ot_pending_review';
    END IF;
  END IF;
  
  -- When HR certifies → notify BOD
  IF NEW.status = 'hr_certified' AND OLD.status = 'supervisor_verified' THEN
    SELECT array_agg(user_id) INTO bod_users
    FROM user_roles WHERE role = 'bod';
    
    IF bod_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(bod_users),
             'OT Request Ready for BOD Review',
             'A new OT request has been certified by HR and is ready for your review.',
             '/bod/approve',
             'ot_pending_review';
    END IF;
  END IF;
  
  -- When HR rejects after supervisor verification → notify both employee AND supervisor
  IF NEW.status = 'rejected' AND OLD.status = 'supervisor_verified' THEN
    INSERT INTO notifications (user_id, title, message, link, notification_type)
    VALUES (
      employee_id,
      'Your OT Request Has Been Rejected by HR',
      'Your OT request has been rejected by HR. Please review the remarks and resubmit.',
      '/ot/history',
      'ot_rejected'
    );
    
    IF supervisor_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      VALUES (
        supervisor_id,
        'OT Request Rejected by HR',
        'An OT request you verified has been rejected by HR. The employee may resubmit.',
        '/supervisor/verify',
        'ot_rejected'
      );
    END IF;
  END IF;
  
  -- When BOD rejects → send to HR for recertification
  IF NEW.status = 'pending_hr_recertification' AND OLD.status = 'hr_certified' THEN
    SELECT array_agg(user_id) INTO hr_users
    FROM user_roles WHERE role = 'hr';
    
    IF hr_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(hr_users),
             'BOD Rejected OT Request - Recertification Required',
             'BOD has rejected an OT request. Please review and decide whether to recertify or send back to employee.',
             '/hr/recertify',
             'ot_rejected';
    END IF;
  END IF;
  
  -- When supervisor rejects → notify employee
  IF NEW.status = 'rejected' AND OLD.status = 'pending_verification' THEN
    INSERT INTO notifications (user_id, title, message, link, notification_type)
    VALUES (
      employee_id,
      'Your OT Request Has Been Rejected by Supervisor',
      'Your OT request has been rejected by your supervisor. Please review the remarks and resubmit if applicable.',
      '/ot/history',
      'ot_rejected'
    );
  END IF;
  
  -- When employee resubmits → notify supervisor and HR
  IF NEW.is_resubmission = true AND NEW.status = 'pending_verification' AND OLD.status IS NULL THEN
    IF supervisor_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      VALUES (
        supervisor_id,
        'OT Request Resubmitted',
        'An employee has resubmitted a previously rejected OT request. Please review again.',
        '/supervisor/verify',
        'ot_pending_review'
      );
    END IF;
    
    SELECT array_agg(user_id) INTO hr_users
    FROM user_roles WHERE role = 'hr';
    
    IF hr_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(hr_users),
             'OT Request Resubmitted by Employee',
             'A previously rejected OT request has been resubmitted.',
             '/hr/approve',
             'ot_pending_review';
    END IF;
  END IF;
  
  -- When HR recertifies and sends back to BOD
  IF NEW.status = 'hr_certified' AND OLD.status = 'pending_hr_recertification' THEN
    SELECT array_agg(user_id) INTO bod_users
    FROM user_roles WHERE role = 'bod';
    
    IF bod_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(bod_users),
             'OT Request Recertified by HR',
             'HR has recertified an OT request. Please review again.',
             '/bod/approve',
             'ot_pending_review';
    END IF;
  END IF;
  
  -- When HR declines recertification → notify employee
  IF NEW.status = 'rejected' AND OLD.status = 'pending_hr_recertification' THEN
    INSERT INTO notifications (user_id, title, message, link, notification_type)
    VALUES (
      employee_id,
      'Your OT Request Requires Revision',
      'HR has declined to recertify your OT request. Please review the remarks and resubmit with corrections.',
      '/ot/history',
      'ot_rejected'
    );
    
    IF supervisor_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      VALUES (
        supervisor_id,
        'OT Request Sent Back for Revision',
        'An OT request from your team has been sent back by HR for employee correction.',
        '/supervisor/verify',
        'ot_rejected'
      );
    END IF;
  END IF;
  
  -- When BOD approves → notify employee
  IF NEW.status = 'bod_approved' AND OLD.status = 'hr_certified' THEN
    INSERT INTO notifications (user_id, title, message, link, notification_type)
    VALUES (
      employee_id,
      'Your OT Request Has Been Fully Approved',
      'Your OT request has been finalized and approved by BOD.',
      '/ot/history',
      'ot_approved'
    );
  END IF;
  
  RETURN NEW;
END;
$$;