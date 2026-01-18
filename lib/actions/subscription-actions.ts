"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendConfirmationEmail, sendWelcomeEmail, sendUnsubscribeConfirmation } from "@/lib/email/send";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function subscribeEmail(email: string) {
  try {
    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      return {
        success: false,
        error: result.error.errors[0].message,
      };
    }

    const supabase = createServerSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.status === "active") {
        return {
          success: false,
          error: "This email is already subscribed",
        };
      }

      if (existing.status === "pending") {
        // Resend confirmation email
        const { data: subscriber } = await supabase
          .from("subscribers")
          .select("confirmation_token")
          .eq("id", existing.id)
          .single();

        if (subscriber?.confirmation_token) {
          await sendConfirmationEmail(email, subscriber.confirmation_token);
        }

        return {
          success: true,
          message: "Confirmation email resent. Please check your inbox.",
        };
      }

      if (existing.status === "unsubscribed") {
        // Reactivate subscription
        const { data: updated } = await supabase
          .from("subscribers")
          .update({
            status: "pending",
            unsubscribed_at: null,
          })
          .eq("id", existing.id)
          .select("confirmation_token")
          .single();

        if (updated?.confirmation_token) {
          await sendConfirmationEmail(email, updated.confirmation_token);
        }

        return {
          success: true,
          message: "Confirmation email sent. Please check your inbox.",
        };
      }
    }

    // Create new subscriber
    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .insert({
        email,
        status: "pending",
        source: "website",
      })
      .select("confirmation_token")
      .single();

    if (error) {
      console.error("Error creating subscriber:", error);
      return {
        success: false,
        error: "Failed to subscribe. Please try again.",
      };
    }

    // Send confirmation email
    if (subscriber?.confirmation_token) {
      await sendConfirmationEmail(email, subscriber.confirmation_token);
    }

    return {
      success: true,
      message: "Confirmation email sent! Please check your inbox.",
    };
  } catch (error) {
    console.error("Subscribe error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function confirmSubscription(token: string) {
  try {
    const supabase = createServerSupabaseClient();

    // Find subscriber by confirmation token
    const { data: subscriber, error: findError } = await supabase
      .from("subscribers")
      .select("id, email, status, user_id")
      .eq("confirmation_token", token)
      .single();

    if (findError || !subscriber) {
      return {
        success: false,
        error: "Invalid or expired confirmation link",
      };
    }

    if (subscriber.status === "active") {
      return {
        success: true,
        message: "Your subscription is already active!",
      };
    }

    // Update subscriber status
    const { error: updateError } = await supabase
      .from("subscribers")
      .update({
        status: "active",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error updating subscriber:", updateError);
      return {
        success: false,
        error: "Failed to confirm subscription",
      };
    }

    // Send welcome email
    await sendWelcomeEmail(subscriber.email, !!subscriber.user_id);

    return {
      success: true,
      message: "Subscription confirmed! Welcome aboard!",
    };
  } catch (error) {
    console.error("Confirm error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function unsubscribeEmail(token: string) {
  try {
    const supabase = createServerSupabaseClient();

    // Find subscriber by unsubscribe token
    const { data: subscriber, error: findError } = await supabase
      .from("subscribers")
      .select("id, email, status")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !subscriber) {
      return {
        success: false,
        error: "Invalid unsubscribe link",
      };
    }

    if (subscriber.status === "unsubscribed") {
      return {
        success: true,
        message: "You are already unsubscribed",
      };
    }

    // Update subscriber status
    const { error: updateError } = await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error unsubscribing:", updateError);
      return {
        success: false,
        error: "Failed to unsubscribe",
      };
    }

    // Send confirmation email
    await sendUnsubscribeConfirmation(subscriber.email);

    return {
      success: true,
      message: "You've been successfully unsubscribed",
    };
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
