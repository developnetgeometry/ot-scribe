-- Add foreign key constraints to role_change_audit table
-- This allows user deletion to work properly

-- First, add foreign key for user_id (the user whose role changed)
-- Use ON DELETE CASCADE so if user is deleted, their audit entries are deleted
ALTER TABLE public.role_change_audit
ADD CONSTRAINT role_change_audit_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add foreign key for changed_by (the user who made the change)
-- Use ON DELETE SET NULL so if the person who made the change is deleted,
-- we keep the audit log but just set changed_by to null
ALTER TABLE public.role_change_audit
ADD CONSTRAINT role_change_audit_changed_by_fkey
FOREIGN KEY (changed_by) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Make changed_by nullable to support SET NULL behavior
ALTER TABLE public.role_change_audit
ALTER COLUMN changed_by DROP NOT NULL;