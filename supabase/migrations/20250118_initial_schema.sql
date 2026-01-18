-- Newsletter Subscription Manager Database Schema
-- This migration creates all tables, indexes, RLS policies, and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABLES
-- ===========================================

-- Users table (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'admin', 'import')),
  confirmation_token TEXT UNIQUE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_token TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_user_id ON subscribers(user_id);
CREATE INDEX idx_subscribers_confirmation_token ON subscribers(confirmation_token);
CREATE INDEX idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token);

-- Subscription preferences table
CREATE TABLE subscription_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subscriber_id, category)
);

CREATE INDEX idx_preferences_subscriber ON subscription_preferences(subscriber_id);
CREATE INDEX idx_preferences_category ON subscription_preferences(category);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  category TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_category ON campaigns(category);

-- Campaign sends table (tracks individual email sends)
CREATE TABLE campaign_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE NOT NULL,
  email_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, subscriber_id)
);

CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_subscriber ON campaign_sends(subscriber_id);
CREATE INDEX idx_campaign_sends_status ON campaign_sends(status);
CREATE INDEX idx_campaign_sends_email_id ON campaign_sends(email_id);

-- Email events table (detailed event tracking)
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_send_id UUID REFERENCES campaign_sends(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_events_send ON email_events(campaign_send_id);
CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_email_events_created_at ON email_events(created_at);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure random tokens
CREATE OR REPLACE FUNCTION generate_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Auto-update updated_at columns
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscription_preferences_updated_at
  BEFORE UPDATE ON subscription_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER campaign_sends_updated_at
  BEFORE UPDATE ON campaign_sends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate tokens for new subscribers
CREATE OR REPLACE FUNCTION generate_subscriber_tokens()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token = generate_token();
  END IF;
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token = generate_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscribers_generate_tokens
  BEFORE INSERT ON subscribers
  FOR EACH ROW EXECUTE FUNCTION generate_subscriber_tokens();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role has full access to users" ON users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Subscribers table policies
CREATE POLICY "Public can subscribe" ON subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON subscribers
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own subscription" ON subscribers
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage all subscribers" ON subscribers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role has full access to subscribers" ON subscribers
  FOR ALL
  USING (auth.role() = 'service_role');

-- Subscription preferences policies
CREATE POLICY "Users can view own preferences" ON subscription_preferences
  FOR SELECT
  USING (
    subscriber_id IN (
      SELECT id FROM subscribers
      WHERE user_id IN (
        SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update own preferences" ON subscription_preferences
  FOR ALL
  USING (
    subscriber_id IN (
      SELECT id FROM subscribers
      WHERE user_id IN (
        SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Admins can manage all preferences" ON subscription_preferences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Campaigns policies
CREATE POLICY "Authenticated users can view campaigns" ON campaigns
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage campaigns" ON campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role has full access to campaigns" ON campaigns
  FOR ALL
  USING (auth.role() = 'service_role');

-- Campaign sends policies
CREATE POLICY "Users can view own campaign sends" ON campaign_sends
  FOR SELECT
  USING (
    subscriber_id IN (
      SELECT id FROM subscribers
      WHERE user_id IN (
        SELECT id FROM users WHERE clerk_user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Admins can view all campaign sends" ON campaign_sends
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role has full access to campaign_sends" ON campaign_sends
  FOR ALL
  USING (auth.role() = 'service_role');

-- Email events policies
CREATE POLICY "Service role has full access to email_events" ON email_events
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view email events" ON email_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- ===========================================
-- DEFAULT PREFERENCE CATEGORIES
-- ===========================================

-- Function to create default preferences for new subscribers
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
DECLARE
  default_categories TEXT[] := ARRAY['weekly_digest', 'product_updates', 'announcements'];
  category TEXT;
BEGIN
  FOREACH category IN ARRAY default_categories
  LOOP
    INSERT INTO subscription_preferences (subscriber_id, category, enabled)
    VALUES (NEW.id, category, true)
    ON CONFLICT (subscriber_id, category) DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscribers_create_default_preferences
  AFTER INSERT ON subscribers
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION create_default_preferences();
