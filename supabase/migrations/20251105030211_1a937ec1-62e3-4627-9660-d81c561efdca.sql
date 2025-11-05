-- Rename BOD to Management - Step 1: Add new enum values first

-- Add 'management' to app_role enum (before removing 'bod')
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'management';

-- Add 'management_approved' to ot_status enum (before removing 'bod_approved')
ALTER TYPE ot_status ADD VALUE IF NOT EXISTS 'management_approved';