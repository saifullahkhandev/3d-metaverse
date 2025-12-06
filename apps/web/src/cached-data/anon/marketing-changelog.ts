"use server";
import type { Tables } from "database/types";
import { cacheLife } from "next/cache";
import { createSupabaseAnonServerClient } from "@/supabase-clients/anon/create-supabase-anon-server-client";
import { commonPublicCache } from "@/typed-cache-tags";

/**
 * Cached function to get all PUBLISHED changelog items for public view
 * Cache duration: 1 hour (balanced freshness)
 */
export async function cachedGetAllChangelogItems(): Promise<
  Tables<"marketing_changelog">[]
> {
  "use cache: remote";
  cacheLife("hours");
  commonPublicCache.data.changelog.list.cacheTag();

  const supabase = await createSupabaseAnonServerClient();
  const changelogItemsResponse = await supabase
    .from("marketing_changelog")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (changelogItemsResponse.error) {
    throw changelogItemsResponse.error;
  }

  if (!changelogItemsResponse.data) {
    throw new Error("No data found");
  }

  return changelogItemsResponse.data;
}
