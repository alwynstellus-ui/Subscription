"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/clerk/auth";

export interface UserSubscription {
  id: string;
  user_id: string;
  application_name: string;
  date_subscribed: string;
  date_ending: string | null;
  cost_aed: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  status: 'active' | 'cancelled' | 'expired';
  notes?: string;
  auto_renewal: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscriptions() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("date_subscribed", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return { success: false, error: "Failed to fetch subscriptions" };
    }

    return {
      success: true,
      data: subscriptions || [],
    };
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function addUserSubscription(subscription: {
  application_name: string;
  date_subscribed: string;
  date_ending?: string;
  cost_aed: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  status?: 'active' | 'cancelled' | 'expired';
  notes?: string;
  auto_renewal?: boolean;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: user.id,
        ...subscription,
        status: subscription.status || 'active',
        auto_renewal: subscription.auto_renewal ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding subscription:", error);
      return { success: false, error: "Failed to add subscription" };
    }

    return {
      success: true,
      data,
      message: "Subscription added successfully",
    };
  } catch (error) {
    console.error("Add subscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function updateUserSubscription(
  id: string,
  updates: Partial<Omit<UserSubscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("user_subscriptions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription:", error);
      return { success: false, error: "Failed to update subscription" };
    }

    return {
      success: true,
      data,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    console.error("Update subscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deleteUserSubscription(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("user_subscriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting subscription:", error);
      return { success: false, error: "Failed to delete subscription" };
    }

    return {
      success: true,
      message: "Subscription deleted successfully",
    };
  } catch (error) {
    console.error("Delete subscription error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getSubscriptionStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select("cost_aed, status, billing_cycle")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching stats:", error);
      return { success: false, error: "Failed to fetch statistics" };
    }

    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];

    // Calculate monthly cost
    const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
      let monthlyCost = sub.cost_aed;
      if (sub.billing_cycle === 'yearly') monthlyCost = sub.cost_aed / 12;
      if (sub.billing_cycle === 'quarterly') monthlyCost = sub.cost_aed / 3;
      return total + monthlyCost;
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    return {
      success: true,
      data: {
        total_subscriptions: subscriptions?.length || 0,
        active_subscriptions: activeSubscriptions.length,
        monthly_cost: monthlyTotal,
        yearly_cost: yearlyTotal,
      },
    };
  } catch (error) {
    console.error("Get stats error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
