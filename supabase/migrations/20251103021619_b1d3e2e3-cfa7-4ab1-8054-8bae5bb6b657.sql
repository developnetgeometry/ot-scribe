-- Step 2: Update existing records to use new status names
-- This migration updates all existing OT requests to use the new status names

UPDATE public.ot_requests 
SET status = 'supervisor_verified' 
WHERE status = 'verified';

UPDATE public.ot_requests 
SET status = 'hr_certified' 
WHERE status = 'approved';

UPDATE public.ot_requests 
SET status = 'bod_approved' 
WHERE status = 'reviewed';

-- Update the notification function to use new status names
CREATE OR REPLACE FUNCTION public.notify_ot_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  hr_users UUID[];
  bod_users UUID[];
  employee_id UUID;
BEGIN
  employee_id := NEW.employee_id;
  
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
  
  -- When any role rejects → notify employee
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO notifications (user_id, title, message, link, notification_type)
    VALUES (
      employee_id,
      'Your OT Request Has Been Rejected',
      'Your OT request has been rejected. Please review the remarks and resubmit if applicable.',
      '/ot/history',
      'ot_rejected'
    );
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
$function$;