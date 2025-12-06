"use server";
import { cacheLife } from "next/cache";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabase-admin-client";
import { superAdminCache } from "@/typed-cache-tags";

/**
 * Cached function to get ALL blog posts (drafts + published) for admin view
 * Cache duration: 1 hour (balanced freshness)
 */
export async function cachedGetAllBlogPosts() {
  "use cache: remote";
  cacheLife("hours");
  superAdminCache.data.blog.list.cacheTag();

  const { data, error } = await supabaseAdminClient
    .from("marketing_blog_posts")
    .select(
      `
      *,
      marketing_blog_author_posts(author_id),
      marketing_blog_post_tags_relationship(tag_id)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}
