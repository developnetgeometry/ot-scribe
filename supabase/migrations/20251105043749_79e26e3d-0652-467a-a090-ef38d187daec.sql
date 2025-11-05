-- Change attachment_url to attachment_urls array in ot_requests table
-- This supports multiple attachments (up to 5 files)

-- Step 1: Add new column as array
ALTER TABLE ot_requests 
  ADD COLUMN attachment_urls text[];

-- Step 2: Migrate existing data (convert single URL to array)
UPDATE ot_requests 
  SET attachment_urls = ARRAY[attachment_url]::text[]
  WHERE attachment_url IS NOT NULL AND attachment_url != '';

-- Step 3: Set empty arrays for null values
UPDATE ot_requests 
  SET attachment_urls = ARRAY[]::text[]
  WHERE attachment_urls IS NULL;

-- Step 4: Drop old column
ALTER TABLE ot_requests 
  DROP COLUMN attachment_url;

-- Step 5: Make attachment_urls NOT NULL with default empty array
ALTER TABLE ot_requests 
  ALTER COLUMN attachment_urls SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN attachment_urls SET NOT NULL;