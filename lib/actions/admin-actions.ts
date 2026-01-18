"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/clerk/auth";

export async function getSubscriberStats() {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    // Get total counts
    const { count: totalCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true });

    const { count: activeCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: pendingCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: unsubscribedCount } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "unsubscribed");

    return {
      success: true,
      data: {
        total: totalCount || 0,
        active: activeCount || 0,
        pending: pendingCount || 0,
        unsubscribed: unsubscribedCount || 0,
      },
    };
  } catch (error) {
    console.error("Get subscriber stats error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}

export async function getAllSubscribers(
  page = 1,
  limit = 50,
  status?: string,
  search?: string
) {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    let query = supabase
      .from("subscribers")
      .select("*", { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Error fetching subscribers:", error);
      return { success: false, error: "Failed to fetch subscribers" };
    }

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error("Get subscribers error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deleteSubscriber(id: string) {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting subscriber:", error);
      return { success: false, error: "Failed to delete subscriber" };
    }

    return {
      success: true,
      message: "Subscriber deleted successfully",
    };
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function exportSubscribers(status?: string) {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    let query = supabase.from("subscribers").select("email, status, created_at");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error exporting subscribers:", error);
      return { success: false, error: "Failed to export subscribers" };
    }

    // Convert to CSV
    const csv = [
      ["Email", "Status", "Created At"].join(","),
      ...(data || []).map((row) =>
        [row.email, row.status, row.created_at].join(",")
      ),
    ].join("\n");

    return {
      success: true,
      data: csv,
    };
  } catch (error) {
    console.error("Export subscribers error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
