-- Allow role deletions to be audited without requiring a new_role value
ALTER TABLE public.role_change_audit
ALTER COLUMN new_role DROP NOT NULL;