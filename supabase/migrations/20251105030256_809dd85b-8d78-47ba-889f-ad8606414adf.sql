-- Rename BOD to Management - Step 2: Rename columns

-- Rename columns in ot_requests table
ALTER TABLE ot_requests 
RENAME COLUMN bod_reviewed_at TO management_reviewed_at;

ALTER TABLE ot_requests 
RENAME COLUMN bod_remarks TO management_remarks;