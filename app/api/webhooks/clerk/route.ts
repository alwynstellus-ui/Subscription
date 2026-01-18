import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const supabase = createServerSupabaseClient();

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new Response("Error: No email found", { status: 400 });
    }

    // Get role from public metadata or default to 'user'
    const role = (public_metadata?.role as string) || "user";

    // Upsert user into Supabase
    const { error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_user_id: id,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          role,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "clerk_user_id",
        }
      );

    if (error) {
      console.error("Error upserting user:", error);
      return new Response("Error: Database error", { status: 500 });
    }

    // If user has an email in subscribers table, link them
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("id, user_id")
      .eq("email", email)
      .single();

    if (subscriber && !subscriber.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", id)
        .single();

      if (userData) {
        await supabase
          .from("subscribers")
          .update({ user_id: userData.id })
          .eq("id", subscriber.id);
      }
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete user from Supabase
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("clerk_user_id", id);

    if (error) {
      console.error("Error deleting user:", error);
      return new Response("Error: Database error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
