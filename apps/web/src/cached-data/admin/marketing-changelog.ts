"use server";
import { cacheLife } from "next/cache";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabase-admin-client";
import { superAdminCache } from "@/typed-cache-tags";

/**
 * Cached function to get ALL changelog items (drafts + published) for admin view
 * Cache duration: 1 hour (balanced freshness)
 */
export async function cachedGetAllChangelogs() {
  "use cache: remote";
  cacheLife("hours");
  superAdminCache.data.changelog.list.cacheTag();

  const { data, error } = await supabaseAdminClient
    .from("marketing_changelog")
    .select(
      `
      *,
      marketing_changelog_author_relationship(author_id)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}
