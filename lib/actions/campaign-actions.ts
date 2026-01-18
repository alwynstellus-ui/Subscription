"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser, requireAdmin } from "@/lib/clerk/auth";
import { sendCampaignEmails } from "@/lib/email/campaign";

export async function getAllCampaigns() {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns:", error);
      return { success: false, error: "Failed to fetch campaigns" };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get campaigns error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function createCampaign(formData: {
  name: string;
  subject: string;
  content: string;
  category?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        category: formData.category || null,
        status: "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      return { success: false, error: "Failed to create campaign" };
    }

    return {
      success: true,
      data,
      message: "Campaign created successfully",
    };
  } catch (error) {
    console.error("Create campaign error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function sendCampaign(campaignId: string) {
  try {
    await requireAdmin();

    const result = await sendCampaignEmails(campaignId);

    return result;
  } catch (error) {
    console.error("Send campaign error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getCampaignById(id: string) {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching campaign:", error);
      return { success: false, error: "Failed to fetch campaign" };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get campaign error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getCampaignStats(campaignId: string) {
  try {
    await requireAdmin();
    const supabase = createServerSupabaseClient();

    const { data: sends, error } = await supabase
      .from("campaign_sends")
      .select("status")
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Error fetching campaign stats:", error);
      return { success: false, error: "Failed to fetch stats" };
    }

    const stats = {
      total: sends?.length || 0,
      sent: sends?.filter(s => s.status === "sent" || s.status === "delivered" || s.status === "opened" || s.status === "clicked").length || 0,
      delivered: sends?.filter(s => s.status === "delivered" || s.status === "opened" || s.status === "clicked").length || 0,
      opened: sends?.filter(s => s.status === "opened" || s.status === "clicked").length || 0,
      clicked: sends?.filter(s => s.status === "clicked").length || 0,
      bounced: sends?.filter(s => s.status === "bounced").length || 0,
      failed: sends?.filter(s => s.status === "failed").length || 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Get campaign stats error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
