import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resend, checkResendConfig } from "./resend";

const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendCampaignEmails(campaignId: string) {
  try {
    checkResendConfig();
    const supabase = createServerSupabaseClient();

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return { success: false, error: "Campaign not found" };
    }

    if (campaign.status === "sent") {
      return { success: false, error: "Campaign already sent" };
    }

    // Update campaign status to sending
    await supabase
      .from("campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // Get active subscribers
    let query = supabase
      .from("subscribers")
      .select("id, email")
      .eq("status", "active");

    // Filter by category if specified
    if (campaign.category) {
      const { data: preferenceSubscribers } = await supabase
        .from("subscription_preferences")
        .select("subscriber_id")
        .eq("category", campaign.category)
        .eq("enabled", true);

      const subscriberIds = preferenceSubscribers?.map(p => p.subscriber_id) || [];
      if (subscriberIds.length > 0) {
        query = query.in("id", subscriberIds);
      } else {
        // No subscribers with this preference enabled
        await supabase
          .from("campaigns")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", campaignId);
        return { success: true, message: "No subscribers match the criteria", sent: 0 };
      }
    }

    const { data: subscribers, error: subsError } = await query;

    if (subsError || !subscribers || subscribers.length === 0) {
      await supabase
        .from("campaigns")
        .update({ status: "draft" })
        .eq("id", campaignId);
      return { success: false, error: "No active subscribers found" };
    }

    // Send emails in batches
    let sent = 0;
    let failed = 0;
    const batchSize = 100;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      for (const subscriber of batch) {
        try {
          // Get unsubscribe token
          const { data: subData } = await supabase
            .from("subscribers")
            .select("unsubscribe_token")
            .eq("id", subscriber.id)
            .single();

          const unsubscribeUrl = `${appUrl}/unsubscribe?token=${subData?.unsubscribe_token}`;

          // Add unsubscribe link to content
          const contentWithUnsubscribe = `
            ${campaign.content}
            <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
            <p style="text-align: center; font-size: 12px; color: #666;">
              <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> from these emails
            </p>
          `;

          const { data: emailData, error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: subscriber.email,
            subject: campaign.subject,
            html: contentWithUnsubscribe,
          });

          if (emailError) {
            console.error(`Failed to send to ${subscriber.email}:`, emailError);
            failed++;

            // Record failed send
            await supabase.from("campaign_sends").insert({
              campaign_id: campaignId,
              subscriber_id: subscriber.id,
              status: "failed",
              error_message: emailError.message,
            });
          } else {
            sent++;

            // Record successful send
            await supabase.from("campaign_sends").insert({
              campaign_id: campaignId,
              subscriber_id: subscriber.id,
              email_id: emailData?.id || null,
              status: "sent",
              sent_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error sending to ${subscriber.email}:`, error);
          failed++;
        }
      }

      // Small delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await supabase
      .from("campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    return {
      success: true,
      message: `Campaign sent to ${sent} subscribers${failed > 0 ? ` (${failed} failed)` : ""}`,
      sent,
      failed,
    };
  } catch (error) {
    console.error("Send campaign error:", error);
    return {
      success: false,
      error: "Failed to send campaign",
    };
  }
}
