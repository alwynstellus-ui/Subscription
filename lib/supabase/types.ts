// Database Types
export type UserRole = "user" | "admin";
export type SubscriberStatus = "pending" | "active" | "unsubscribed";
export type SubscriberSource = "website" | "admin" | "import";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";
export type SendStatus = "pending" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
export type EventType = "sent" | "delivered" | "opened" | "clicked" | "bounced" | "complained";

export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  user_id: string | null;
  status: SubscriberStatus;
  source: SubscriberSource;
  confirmation_token: string | null;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  unsubscribe_token: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPreference {
  id: string;
  subscriber_id: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: CampaignStatus;
  category: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignSend {
  id: string;
  campaign_id: string;
  subscriber_id: string;
  email_id: string | null;
  status: SendStatus;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: string;
  campaign_send_id: string | null;
  event_type: EventType;
  event_data: Record<string, any> | null;
  created_at: string;
}
