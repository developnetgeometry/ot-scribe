-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  notification_type TEXT CHECK (notification_type IN ('ot_approved', 'ot_rejected', 'ot_pending_review')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "notif_read_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify on OT status changes
CREATE OR REPLACE FUNCTION public.notify_ot_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hr_users UUID[];
  bod_users UUID[];
  employee_id UUID;
BEGIN
  employee_id := NEW.employee_id;
  
  -- When supervisor approves → notify HR
  IF NEW.status = 'verified' AND OLD.status = 'pending_verification' THEN
    SELECT array_agg(user_id) INTO hr_users
    FROM user_roles WHERE role = 'hr';
    
    IF hr_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(hr_users), 
             'New OT Request for Approval',
             'A new OT request approved by Supervisor is ready for your review.',
             '/hr/approve',
             'ot_pending_review';
    END IF;
  END IF;
  
  -- When HR approves → notify BOD
  IF NEW.status = 'approved' AND OLD.status = 'verified' THEN
    SELECT array_agg(user_id) INTO bod_users
    FROM user_roles WHERE role = 'bod';
    
    IF bod_users IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, link, notification_type)
      SELECT unnest(bod_users),
             'OT Request Ready for BOD Review',
             'A new OT request has been approved by HR and is ready for your review.',
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
  IF NEW.status = 'reviewed' AND OLD.status = 'approved' THEN
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

-- Create trigger
CREATE TRIGGER ot_status_change_notification
  AFTER UPDATE OF status ON public.ot_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_ot_status_change();