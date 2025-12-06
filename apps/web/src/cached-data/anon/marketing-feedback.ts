"use server";

import type { Database } from "database/types";
import { cacheLife } from "next/cache";
import { createSupabaseAnonServerClient } from "@/supabase-clients/anon/create-supabase-anon-server-client";
import { commonPublicCache } from "@/typed-cache-tags";

type MarketingFeedbackThread =
  Database["public"]["Tables"]["marketing_feedback_threads"]["Row"];
type MarketingFeedbackBoard =
  Database["public"]["Tables"]["marketing_feedback_boards"]["Row"];

/**
 * Cached function to get all active feedback boards
 * Cache duration: 5 minutes (balanced for semi-dynamic content)
 */
export async function cachedGetAnonFeedbackBoards(): Promise<
  MarketingFeedbackBoard[]
> {
  "use cache: remote";
  cacheLife("minutes");
  commonPublicCache.data.feedback.boards.cacheTag();

  const supabase = await createSupabaseAnonServerClient();
  const { data, error } = await supabase
    .from("marketing_feedback_boards")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function cachedGetAnonFeedbackBoardBySlug(slug: string) {
  "use cache: remote";
  cacheLife("minutes");
  commonPublicCache.data.feedback.boardBySlug({ slug }).cacheTag();

  const supabase = await createSupabaseAnonServerClient();
  const { data, error } = await supabase
    .from("marketing_feedback_boards")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Cached function to get recent public feedback
 * Cache duration: 5 minutes
 */
export async function cachedGetRecentPublicFeedback() {
  "use cache: remote";
  cacheLife("minutes");
  commonPublicCache.data.feedback.recent.cacheTag();

  const supabase = await createSupabaseAnonServerClient();
  const { data, error } = await supabase
    .from("marketing_feedback_threads")
    .select("id, title, created_at")
    .or(
      "added_to_roadmap.eq.true,open_for_public_discussion.eq.true,is_publicly_visible.eq.true"
    )
    .is("moderator_hold_category", null)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching recent feedback:", error);
    return [];
  }

  return data;
}

export async function cachedGetAnonUserFeedbackById(
  feedbackId: string
): Promise<MarketingFeedbackThread | null> {
  "use cache: remote";
  cacheLife("minutes");
  commonPublicCache.data.feedback.threadById({ id: feedbackId }).cacheTag();

  const supabase = await createSupabaseAnonServerClient();
  const { data, error } = await supabase
    .from("marketing_feedback_threads")
    .select("*")
    .eq("id", feedbackId)
    .or(
      "added_to_roadmap.eq.true,open_for_public_discussion.eq.true,is_publicly_visible.eq.true"
    )
    .is("moderator_hold_category", null)
    .single();

  if (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }

  return data;
}
