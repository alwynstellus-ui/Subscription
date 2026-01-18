-- Add subscription duration to subscribers table
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER DEFAULT 12;

-- Add comment to explain the column
COMMENT ON COLUMN subscribers.subscription_duration_months IS 'Duration of subscription in months (3, 6, 9, 12, 24, 60)';

-- Add a check constraint to ensure valid duration values
ALTER TABLE subscribers
ADD CONSTRAINT valid_duration_months
CHECK (subscription_duration_months IN (3, 6, 9, 12, 24, 60));
