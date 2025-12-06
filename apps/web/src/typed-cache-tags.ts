import { cacheTag, revalidateTag, updateTag } from "next/cache";
import { z } from "zod";

// 1. Define all cache resources with their argument schemas
export const cacheResources = {
  // Feedback resources
  "all-feedback-threads": z.object({}), // Admin view: all threads (regardless of visibility)
  "published-feedback-threads": z.object({}), // Public view: only publicly visible threads
  "feedback-thread": z.object({ id: z.string() }), // Single thread cache (admin)
  "public-feedback-thread": z.object({ id: z.string() }), // Single thread cache (public)
  "feedback-threads-by-board": z.object({ boardId: z.string() }), // Admin: threads by board
  "public-feedback-threads-by-board": z.object({ boardId: z.string() }), // Public: visible threads by board
  "public-feedback-threads-by-board-slug": z.object({ slug: z.string() }), // Public: visible threads by board slug
  "recent-public-feedback-threads": z.object({}), // Public: recent visible threads
  "feedback-boards": z.object({}), // All feedback boards
  "feedback-board": z.object({ slug: z.string() }), // Single board cache

  // Blog resources
  "all-blog-posts": z.object({}), // Admin view: all posts (drafts + published)
  "published-blog-posts": z.object({}), // Public view: only published posts
  "published-blog-posts-by-tag": z.object({ slug: z.string() }), // Public view: published posts by tag
  "blog-post-by-slug": z.object({ slug: z.string() }), // Single post cache
  "published-blog-posts-by-author": z.object({ authorId: z.string() }), // Public view: published posts by author
  "blog-tags": z.object({}),
  "blog-tag": z.object({ slug: z.string() }),
  "blog-authors": z.object({}),
  "blog-author": z.object({ id: z.string() }),
  "blog-author-by-slug": z.object({ slug: z.string() }),
  "blog-post-by-id": z.object({ id: z.string() }),
  // Changelog resources
  "all-changelogs": z.object({}), // Admin view: all changelogs (drafts + published)
  "published-changelogs": z.object({}), // Public view: only published changelogs
  "changelog-item": z.object({ id: z.string() }), // Single changelog item cache

  // Roadmap resources
  "all-roadmap-items": z.object({}), // Admin view: all roadmap items
  "published-roadmap-items": z.object({}), // Public view: only publicly visible roadmap items
  "public-roadmap-feedback": z.object({}), // Public roadmap feedback items

  // User resources
  theme: z.object({}),
  "user-notifications": z.object({ userId: z.string() }),
  "user-profile": z.object({ userId: z.string() }),
  "user-invitations": z.object({ userId: z.string() }),

  // Workspace resources
  workspaces: z.object({}),
  workspace: z.object({ id: z.string() }),
  "workspace-by-slug": z.object({ slug: z.string() }),
  "workspace-members": z.object({ workspaceId: z.string() }),
  "workspace-invitations": z.object({ workspaceId: z.string() }),

  // Project resources
  projects: z.object({ workspaceId: z.string() }),
  project: z.object({ id: z.string() }),
  "project-by-slug": z.object({ slug: z.string() }),
  "project-comments": z.object({ projectId: z.string() }),
  "project-members": z.object({ projectId: z.string() }),

  // Billing resources
  "stripe-products": z.object({}),
  "workspace-subscription": z.object({ workspaceId: z.string() }),

  // components
  "anon-feedback-list-component": z.object({}),
  "anon-feedback-detail-component": z.object({ id: z.string() }),
  "anon-feedback-page-content-component": z.object({ id: z.string() }),
  "roadmap-page-component": z.object({}),
} as const;

// 2. Type inference from the registry
type CacheResources = typeof cacheResources;
type ResourceId = keyof CacheResources;
type ResourceArgs<K extends ResourceId> = z.infer<CacheResources[K]>;

// 3. Type-safe key generator function
export function getResourceKey<K extends ResourceId>(
  resourceId: K,
  ...args: ResourceArgs<K> extends Record<string, never>
    ? []
    : [args: ResourceArgs<K>]
): string {
  const resolvedArgs = (args[0] ?? {}) as Record<string, unknown>;
  const argValues = Object.values(resolvedArgs);
  if (argValues.length === 0) return resourceId;
  return `${resourceId}:${argValues.join(":")}`;
}

// 4. Cache node interface for revalidate(), update(), and tag
interface CacheNode {
  revalidate: () => void;
  update: () => void;
  tag: string;
  cacheTag: () => void;
}

// 5. Helper to generate cache tag string
function generateTagKey(
  resourceId: string,
  params?: Record<string, string>
): string {
  if (!params || Object.keys(params).length === 0) {
    return resourceId;
  }
  return `${resourceId}:${Object.values(params).join(":")}`;
}

// 6. Factory for resources without params
function tagWithoutParams(resourceId: ResourceId): CacheNode {
  const tagKey = generateTagKey(resourceId);
  return {
    revalidate: () => revalidateTag(tagKey, {}),
    update: () => updateTag(tagKey),
    tag: tagKey,
    cacheTag: () => cacheTag(tagKey),
  };
}

// 7. Factory for resources with params
function tagWithParams<T extends Record<string, string>>(
  resourceId: ResourceId
): (params: T) => CacheNode {
  return (params: T) => {
    const tagKey = generateTagKey(resourceId, params);
    return {
      revalidate: () => revalidateTag(tagKey, {}),
      update: () => updateTag(tagKey),
      tag: tagKey,
      cacheTag: () => cacheTag(tagKey),
    };
  };
}

// 8. Super Admin Cache - internal admin data/components (all resources regardless of visibility)
export const superAdminCache = {
  data: {
    feedback: {
      list: tagWithoutParams("all-feedback-threads"),
      threadById: tagWithParams<{ id: string }>("feedback-thread"),
      threadsByBoardId: tagWithParams<{ boardId: string }>(
        "feedback-threads-by-board"
      ),
      boards: tagWithoutParams("feedback-boards"),
      boardBySlug: tagWithParams<{ slug: string }>("feedback-board"),
    },
    blog: {
      list: tagWithoutParams("all-blog-posts"),
      postById: tagWithParams<{ id: string }>("blog-post-by-id"),
      postBySlug: tagWithParams<{ slug: string }>("blog-post-by-slug"),
      tags: tagWithoutParams("blog-tags"),
      tagBySlug: tagWithParams<{ slug: string }>("blog-tag"),
      authors: tagWithoutParams("blog-authors"),
      authorById: tagWithParams<{ id: string }>("blog-author"),
      authorBySlug: tagWithParams<{ slug: string }>("blog-author-by-slug"),
    },
    changelog: {
      list: tagWithoutParams("all-changelogs"),
      itemById: tagWithParams<{ id: string }>("changelog-item"),
    },
    roadmap: {
      list: tagWithoutParams("all-roadmap-items"),
    },
  },
  components: {
    feedback: {
      anonList: tagWithoutParams("anon-feedback-list-component"),
    },
  },
};

// 9. Common Cache - data common for all users (public/published resources)
export const commonPublicCache = {
  data: {
    feedback: {
      list: tagWithoutParams("published-feedback-threads"),
      recent: tagWithoutParams("recent-public-feedback-threads"),
      threadById: tagWithParams<{ id: string }>("public-feedback-thread"),
      threadsByBoardId: tagWithParams<{ boardId: string }>(
        "public-feedback-threads-by-board"
      ),
      threadsByBoardSlug: tagWithParams<{ slug: string }>(
        "public-feedback-threads-by-board-slug"
      ),
      boards: tagWithoutParams("feedback-boards"),
      boardBySlug: tagWithParams<{ slug: string }>("feedback-board"),
    },
    blog: {
      list: tagWithoutParams("published-blog-posts"),
      postBySlug: tagWithParams<{ slug: string }>("blog-post-by-slug"),
      postsByTag: tagWithParams<{ slug: string }>(
        "published-blog-posts-by-tag"
      ),
      postsByAuthor: tagWithParams<{ authorId: string }>(
        "published-blog-posts-by-author"
      ),
      tags: tagWithoutParams("blog-tags"),
      tagBySlug: tagWithParams<{ slug: string }>("blog-tag"),
      authors: tagWithoutParams("blog-authors"),
      authorBySlug: tagWithParams<{ slug: string }>("blog-author-by-slug"),
    },
    changelog: {
      list: tagWithoutParams("published-changelogs"),
    },
    roadmap: {
      list: tagWithoutParams("published-roadmap-items"),
      feedback: tagWithoutParams("public-roadmap-feedback"),
    },
    billing: {
      stripeProducts: tagWithoutParams("stripe-products"),
    },
  },
  components: {
    feedback: {
      list: tagWithoutParams("anon-feedback-list-component"),
      detailPage: tagWithParams<{ id: string }>(
        "anon-feedback-detail-component"
      ),
      pageContent: tagWithParams<{ id: string }>(
        "anon-feedback-page-content-component"
      ),
    },
    roadmap: {
      page: tagWithoutParams("roadmap-page-component"),
    },
  },
};

// 10. User Cache - data/components for logged-in users
export const userCache = {
  data: {
    notifications: tagWithParams<{ userId: string }>("user-notifications"),
    profile: tagWithParams<{ userId: string }>("user-profile"),
    invitations: tagWithParams<{ userId: string }>("user-invitations"),
    workspaces: {
      list: tagWithoutParams("workspaces"),
      byId: tagWithParams<{ id: string }>("workspace"),
      bySlug: tagWithParams<{ slug: string }>("workspace-by-slug"),
      members: tagWithParams<{ workspaceId: string }>("workspace-members"),
      invitations: tagWithParams<{ workspaceId: string }>(
        "workspace-invitations"
      ),
      subscription: tagWithParams<{ workspaceId: string }>(
        "workspace-subscription"
      ),
      projects: tagWithParams<{ workspaceId: string }>("projects"),
    },
    projects: {
      byId: tagWithParams<{ id: string }>("project"),
      bySlug: tagWithParams<{ slug: string }>("project-by-slug"),
      comments: tagWithParams<{ projectId: string }>("project-comments"),
      members: tagWithParams<{ projectId: string }>("project-members"),
    },
  },
};
