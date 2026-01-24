"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/clerk/auth";
import { searchGmailEmails, batchGetGmailMessages } from "@/lib/email/gmail-client";
import { searchOutlookEmails } from "@/lib/email/outlook-client";
import { parseMultipleEmails, type ParsedSubscription } from "@/lib/email/subscription-parser";

export interface EmailConnection {
  id: string;
  user_id: string;
  provider: 'gmail' | 'outlook';
  email_address: string;
  status: 'active' | 'expired' | 'disconnected';
  last_scanned_at: string | null;
  created_at: string;
}

/**
 * Get user's email connections
 */
export async function getEmailConnections() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { data: connections, error } = await supabase
      .from("email_connections")
      .select("id, user_id, provider, email_address, status, last_scanned_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching connections:", error);
      return { success: false, error: "Failed to fetch connections" };
    }

    return {
      success: true,
      data: connections || [],
    };
  } catch (error) {
    console.error("Get connections error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Save email connection
 */
export async function saveEmailConnection(connection: {
  provider: 'gmail' | 'outlook';
  email_address: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const expiresAt = new Date(Date.now() + connection.expires_in * 1000).toISOString();

    const { data, error } = await supabase
      .from("email_connections")
      .upsert(
        {
          user_id: user.id,
          provider: connection.provider,
          email_address: connection.email_address,
          access_token: connection.access_token,
          refresh_token: connection.refresh_token || null,
          token_expires_at: expiresAt,
          status: 'active',
        },
        {
          onConflict: 'user_id,provider',
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving connection:", error);
      return { success: false, error: "Failed to save connection" };
    }

    return {
      success: true,
      data,
      message: "Email account connected successfully",
    };
  } catch (error) {
    console.error("Save connection error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete email connection
 */
export async function deleteEmailConnection(connectionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("email_connections")
      .delete()
      .eq("id", connectionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting connection:", error);
      return { success: false, error: "Failed to delete connection" };
    }

    return {
      success: true,
      message: "Connection removed successfully",
    };
  } catch (error) {
    console.error("Delete connection error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Scan emails for subscriptions
 */
export async function scanEmailsForSubscriptions(connectionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    // Get connection details
    const { data: connection, error: connectionError } = await supabase
      .from("email_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection) {
      return { success: false, error: "Connection not found" };
    }

    let emails: any[] = [];

    // Fetch emails based on provider
    if (connection.provider === 'gmail') {
      const messageIds = await searchGmailEmails(connection.access_token);
      emails = await batchGetGmailMessages(connection.access_token, messageIds.slice(0, 100));
    } else if (connection.provider === 'outlook') {
      emails = await searchOutlookEmails(connection.access_token, 100);
    }

    // Parse emails for subscriptions
    const parsedSubscriptions = parseMultipleEmails(emails);

    // Update last scanned timestamp
    await supabase
      .from("email_connections")
      .update({ last_scanned_at: new Date().toISOString() })
      .eq("id", connectionId);

    return {
      success: true,
      data: parsedSubscriptions,
      message: `Scanned ${emails.length} emails, found ${parsedSubscriptions.length} potential subscriptions`,
    };
  } catch (error: any) {
    console.error("Scan emails error:", error);

    // Check if token expired
    if (error.message?.includes('401') || error.message?.includes('token')) {
      return {
        success: false,
        error: "Email connection expired. Please reconnect your account.",
        expired: true,
      };
    }

    return {
      success: false,
      error: "Failed to scan emails. Please try again.",
    };
  }
}
