-- Create table for tracking user's external subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Subscription details
  application_name TEXT NOT NULL,
  date_subscribed DATE NOT NULL,
  date_ending DATE,
  cost_aed DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

  -- Additional info
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'one-time')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  notes TEXT,

  -- Auto-renewal
  auto_renewal BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_date_ending ON user_subscriptions(date_ending);

-- RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_subscriptions.user_id));

-- Users can insert their own subscriptions
CREATE POLICY "Users can create their own subscriptions"
  ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_subscriptions.user_id));

-- Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions
  FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_subscriptions.user_id));

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions"
  ON user_subscriptions
  FOR DELETE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_subscriptions.user_id));

-- Service role has full access (for server-side operations via Clerk auth)
CREATE POLICY "Service role has full access to user_subscriptions"
  ON user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Add comment
COMMENT ON TABLE user_subscriptions IS 'Tracks user subscriptions to external applications and services';
