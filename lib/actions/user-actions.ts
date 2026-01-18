"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/clerk/auth";

export async function getUserSubscription() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    // Get subscriber info
    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching subscription:", error);
      return { success: false, error: "Failed to fetch subscription" };
    }

    return {
      success: true,
      data: subscriber || null,
    };
  } catch (error) {
    console.error("Get subscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getUserPreferences() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    // Get subscriber
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!subscriber) {
      return { success: false, error: "No subscription found" };
    }

    // Get preferences
    const { data: preferences, error } = await supabase
      .from("subscription_preferences")
      .select("*")
      .eq("subscriber_id", subscriber.id);

    if (error) {
      console.error("Error fetching preferences:", error);
      return { success: false, error: "Failed to fetch preferences" };
    }

    return {
      success: true,
      data: preferences || [],
    };
  } catch (error) {
    console.error("Get preferences error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function updateUserPreferences(preferences: Record<string, boolean>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    // Get subscriber
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!subscriber) {
      return { success: false, error: "No subscription found" };
    }

    // Update preferences
    for (const [category, enabled] of Object.entries(preferences)) {
      await supabase
        .from("subscription_preferences")
        .upsert({
          subscriber_id: subscriber.id,
          category,
          enabled,
        }, {
          onConflict: "subscriber_id,category",
        });
    }

    return {
      success: true,
      message: "Preferences updated successfully",
    };
  } catch (error) {
    console.error("Update preferences error:", error);
    return {
      success: false,
      error: "Failed to update preferences",
    };
  }
}

export async function getCampaignHistory() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    // Get subscriber
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!subscriber) {
      return { success: false, error: "No subscription found" };
    }

    // Get campaign sends with campaign details
    const { data: sends, error } = await supabase
      .from("campaign_sends")
      .select(`
        *,
        campaigns (
          id,
          name,
          subject,
          sent_at
        )
      `)
      .eq("subscriber_id", subscriber.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching history:", error);
      return { success: false, error: "Failed to fetch history" };
    }

    return {
      success: true,
      data: sends || [],
    };
  } catch (error) {
    console.error("Get history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
