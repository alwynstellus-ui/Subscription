import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin in Supabase
  const supabase = createServerSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("role")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return userId;
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
