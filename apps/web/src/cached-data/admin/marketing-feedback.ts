"use server";
import { cacheLife } from "next/cache";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabase-admin-client";
import { superAdminCache } from "@/typed-cache-tags";

/**
 * Cached function to get ALL feedback threads (regardless of visibility) for admin view
 * Cache duration: 5 minutes (feedback changes frequently)
 */
export async function cachedGetAllFeedbackThreads() {
  "use cache: remote";
  cacheLife("minutes");
  superAdminCache.data.feedback.list.cacheTag();

  const { data, error } = await supabaseAdminClient
    .from("marketing_feedback_threads")
    .select(
      `
      *,
      user_profiles(full_name, avatar_url),
      marketing_feedback_boards(title, slug)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}
