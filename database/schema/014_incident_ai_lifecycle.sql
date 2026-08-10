-- CloudOps AI
-- Incident asynchronous AI lifecycle

ALTER TABLE incidents
ADD COLUMN ai_status
ENUM(
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
)
NOT NULL DEFAULT 'PENDING'
AFTER ai_analysis;

ALTER TABLE incidents
ADD COLUMN ai_retry_count INT NOT NULL DEFAULT 0
AFTER ai_status;

ALTER TABLE incidents
ADD COLUMN ai_error TEXT NULL
AFTER ai_retry_count;

-- Existing incidents that already have AI results
-- should be considered completed.
UPDATE incidents
SET
    ai_status = 'COMPLETED',
    ai_error = NULL
WHERE ai_analysis IS NOT NULL
  AND ai_status = 'PENDING';
