-- Rename BOD to Management - Step 3: Update data and trigger function

-- Update existing user roles data
UPDATE user_roles 
SET role = 'management'::app_role
WHERE role = 'bod'::app_role;

-- Update existing OT request statuses
UPDATE ot_requests 
SET status = 'management_approved'::ot_status
WHERE status = 'bod_approved'::ot_status;

-- Update the notification trigger function to reference management instead of bod
CREATE OR REPLACE FUNCTION public.notify_ot_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  hr_users UUID[];
  management_users UUID[];
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
  
  -- When HR certifies → notify Management
  IF NEW.status = 'hr_certified' AND OLD.status = 'supervisor_verified' THEN
    SELECT array_agg(user_id) INTO management_users
    FROM user_roles WHERE role = 'management';
    
    IF management_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(management_users),
             'OT Request Ready for Management Review',
             'A new OT request has been certified by HR and is ready for your review.',
             '/management/approve',
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
  
  -- When Management rejects → send to HR for recertification
  IF NEW.status = 'pending_hr_recertification' AND OLD.status = 'hr_certified' THEN
    SELECT array_agg(user_id) INTO hr_users
    FROM user_roles WHERE role = 'hr';
    
    IF hr_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(hr_users),
             'Management Rejected OT Request - Recertification Required',
             'Management has rejected an OT request. Please review and decide whether to recertify or send back to employee.',
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
  
  -- When HR recertifies and sends back to Management
  IF NEW.status = 'hr_certified' AND OLD.status = 'pending_hr_recertification' THEN
    SELECT array_agg(user_id) INTO management_users
    FROM user_roles WHERE role = 'management';
    
    IF management_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(management_users),
             'OT Request Recertified by HR',
             'HR has recertified an OT request. Please review again.',
             '/management/approve',
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
  
  -- When Management approves → notify employee
  IF NEW.status = 'management_approved' AND OLD.status = 'hr_certified' THEN
    INSERT INTO notifications (user_id, title, message, link, notification_type)
    VALUES (
      employee_id,
      'Your OT Request Has Been Fully Approved',
      'Your OT request has been finalized and approved by Management.',
      '/ot/history',
      'ot_approved'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;