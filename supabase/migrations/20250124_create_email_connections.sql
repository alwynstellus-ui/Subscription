-- Create table for storing user email connections
CREATE TABLE IF NOT EXISTS email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Email provider
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email_address TEXT NOT NULL,

  -- OAuth tokens (encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,

  -- Connection status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disconnected')),
  last_scanned_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one connection per user per provider
  UNIQUE(user_id, provider)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_connections_user_id ON email_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_email_connections_status ON email_connections(status);

-- RLS policies
ALTER TABLE email_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connections
CREATE POLICY "Users can view their own email connections"
  ON email_connections
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = email_connections.user_id));

-- Users can create their own connections
CREATE POLICY "Users can create their own email connections"
  ON email_connections
  FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = email_connections.user_id));

-- Users can update their own connections
CREATE POLICY "Users can update their own email connections"
  ON email_connections
  FOR UPDATE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = email_connections.user_id));

-- Users can delete their own connections
CREATE POLICY "Users can delete their own email connections"
  ON email_connections
  FOR DELETE
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = email_connections.user_id));

-- Service role has full access
CREATE POLICY "Service role has full access to email_connections"
  ON email_connections
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER email_connections_updated_at
  BEFORE UPDATE ON email_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_email_connections_updated_at();

-- Add comment
COMMENT ON TABLE email_connections IS 'Stores user email account connections for scanning subscriptions';
