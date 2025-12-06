"use server";
import type { Tables } from "database/types";
import { supabaseAnonClient } from "@/supabase-clients/anon/supabase-anon-client";

export async function anonGetAllChangelogItems(): Promise<
  Tables<"marketing_changelog">[]
> {
  const changelogItemsResponse = await supabaseAnonClient
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
