import { revalidateTag, updateTag } from "next/cache";
import { getResourceKey } from "@/typed-cache-tags";

/**
 * Cache invalidation utilities for Next.js 15 cache tags
 *
 * Two variants for each resource:
 * - revalidate*Resource: Uses revalidateTag (just invalidates cache)
 * - update*Resource: Uses updateTag (invalidates + fetches server payload for RSCs)
 */

// Changelog invalidation
export const revalidateAllChangelogsResource = () => {
  revalidateTag(getResourceKey("all-changelogs"), {});
};

export const updateAllChangelogsResource = () => {
  updateTag(getResourceKey("all-changelogs"));
};

export const revalidatePublishedChangelogsResource = () => {
  revalidateTag(getResourceKey("published-changelogs"), {});
};

export const updatePublishedChangelogsResource = () => {
  updateTag(getResourceKey("published-changelogs"));
};

export const revalidateChangelogItemByIdResource = (id: string) => {
  revalidateTag(getResourceKey("changelog-item", { id }), {});
};

export const updateChangelogItemByIdResource = (id: string) => {
  updateTag(getResourceKey("changelog-item", { id }));
};

// Blog post invalidation
export const revalidateAllBlogPostsResource = () => {
  revalidateTag(getResourceKey("all-blog-posts"), {});
};

export const updateAllBlogPostsResource = () => {
  updateTag(getResourceKey("all-blog-posts"));
};

export const revalidatePublishedBlogPostsResource = () => {
  revalidateTag(getResourceKey("published-blog-posts"), {});
};

export const updatePublishedBlogPostsResource = () => {
  updateTag(getResourceKey("published-blog-posts"));
};

export const revalidateBlogPostResourceBySlug = (slug: string) => {
  revalidateTag(getResourceKey("blog-post-by-slug", { slug }), {});
  revalidateTag(getResourceKey("all-blog-posts"), {});
};

export const updateBlogPostResourceBySlug = (slug: string) => {
  updateTag(getResourceKey("blog-post-by-slug", { slug }));
  updateTag(getResourceKey("all-blog-posts"));
};

export const updateBlogPostResourceById = (id: string) => {
  updateTag(getResourceKey("blog-post-by-id", { id }));
  updateTag(getResourceKey("all-blog-posts"));
};

export const revalidateBlogPostResourceById = (id: string) => {
  revalidateTag(getResourceKey("blog-post-by-id", { id }), {});
  revalidateTag(getResourceKey("all-blog-posts"), {});
};

export const revalidatePublishedBlogPostsByTagResource = (tagSlug: string) => {
  revalidateTag(
    getResourceKey("published-blog-posts-by-tag", { slug: tagSlug }),
    {}
  );
};

export const updatePublishedBlogPostsByTagResource = (tagSlug: string) => {
  updateTag(getResourceKey("published-blog-posts-by-tag", { slug: tagSlug }));
};

// Blog tag invalidation
export const revalidateBlogTagsResource = () => {
  revalidateTag(getResourceKey("blog-tags"), {});
  revalidateTag(getResourceKey("all-blog-posts"), {});
  revalidateTag(getResourceKey("published-blog-posts"), {});
};

export const updateBlogTagsResource = () => {
  updateTag(getResourceKey("blog-tags"));
  updateTag(getResourceKey("all-blog-posts"));
  updateTag(getResourceKey("published-blog-posts"));
};

export const revalidateBlogTagResource = (slug: string) => {
  revalidateTag(getResourceKey("blog-tag", { slug }), {});
  revalidateTag(getResourceKey("blog-tags"), {});
  revalidateTag(getResourceKey("all-blog-posts"), {});
  revalidateTag(getResourceKey("published-blog-posts"), {});
  revalidateTag(getResourceKey("published-blog-posts-by-tag", { slug }), {});
};

export const updateBlogTagResource = (slug: string) => {
  updateTag(getResourceKey("blog-tag", { slug }));
  updateTag(getResourceKey("blog-tags"));
  updateTag(getResourceKey("all-blog-posts"));
  updateTag(getResourceKey("published-blog-posts"));
  updateTag(getResourceKey("published-blog-posts-by-tag", { slug }));
};

// Blog author invalidation
export const revalidateBlogAuthorsResource = () => {
  revalidateTag(getResourceKey("blog-authors"), {});
};

export const updateBlogAuthorsResource = () => {
  updateTag(getResourceKey("blog-authors"));
};

export const revalidateBlogAuthorResource = (id: string) => {
  revalidateTag(getResourceKey("blog-author", { id }), {});
  revalidateTag(getResourceKey("blog-authors"), {});
  revalidateTag(getResourceKey("all-blog-posts"), {});
  revalidateTag(getResourceKey("published-blog-posts"), {});
};

export const updateBlogAuthorResource = (id: string) => {
  updateTag(getResourceKey("blog-author", { id }));
  updateTag(getResourceKey("blog-authors"));
  updateTag(getResourceKey("all-blog-posts"));
  updateTag(getResourceKey("published-blog-posts"));
};

export const revalidatePublishedBlogPostsByAuthorResource = (
  authorId: string
) => {
  revalidateTag(
    getResourceKey("published-blog-posts-by-author", { authorId }),
    {}
  );
};

export const updatePublishedBlogPostsByAuthorResource = (authorId: string) => {
  updateTag(getResourceKey("published-blog-posts-by-author", { authorId }));
};

export const revalidateBlogAuthorBySlugResource = (slug: string) => {
  revalidateTag(getResourceKey("blog-author-by-slug", { slug }), {});
};

export const updateBlogAuthorBySlugResource = (slug: string) => {
  updateTag(getResourceKey("blog-author-by-slug", { slug }));
};

// Feedback thread invalidation
export const revalidateAllFeedbackThreadsResource = () => {
  revalidateTag(getResourceKey("all-feedback-threads"), {});
};

export const updateAllFeedbackThreadsResource = () => {
  updateTag(getResourceKey("all-feedback-threads"));
};

export const revalidatePublicFeedbackThreadsResource = () => {
  revalidateTag(getResourceKey("published-feedback-threads"), {});
};

export const updatePublicFeedbackThreadsResource = () => {
  updateTag(getResourceKey("published-feedback-threads"));
};

export const revalidateAnonFeedbackListComponentResource = () => {
  revalidateTag(getResourceKey("anon-feedback-list-component"), {});
};

export const revalidateRecentPublicFeedbackThreadsResource = () => {
  revalidateTag(getResourceKey("recent-public-feedback-threads"), {});
};

export const updateRecentPublicFeedbackThreadsResource = () => {
  updateTag(getResourceKey("recent-public-feedback-threads"));
};

export const revalidateFeedbackThreadByIdResource = (id: string) => {
  revalidateTag(getResourceKey("feedback-thread", { id }), {});
};

export const updateFeedbackThreadByIdResource = (id: string) => {
  updateTag(getResourceKey("feedback-thread", { id }));
};

export const revalidatePublicFeedbackThreadByIdResource = (id: string) => {
  revalidateTag(getResourceKey("public-feedback-thread", { id }), {});
};

export const updatePublicFeedbackThreadByIdResource = (id: string) => {
  updateTag(getResourceKey("public-feedback-thread", { id }));
};

export const revalidateFeedbackThreadsByBoardIdResource = (boardId: string) => {
  revalidateTag(getResourceKey("feedback-threads-by-board", { boardId }), {});
};

export const updateFeedbackThreadsByBoardIdResource = (boardId: string) => {
  updateTag(getResourceKey("feedback-threads-by-board", { boardId }));
};

export const revalidatePublicFeedbackThreadsByBoardIdResource = (
  boardId: string
) => {
  revalidateTag(
    getResourceKey("public-feedback-threads-by-board", { boardId }),
    {}
  );
};

export const updatePublicFeedbackThreadsByBoardIdResource = (
  boardId: string
) => {
  updateTag(getResourceKey("public-feedback-threads-by-board", { boardId }));
};

export const revalidatePublicFeedbackThreadsByBoardSlugResource = (
  slug: string
) => {
  revalidateTag(
    getResourceKey("public-feedback-threads-by-board-slug", { slug }),
    {}
  );
};

export const updatePublicFeedbackThreadsByBoardSlugResource = (
  slug: string
) => {
  updateTag(getResourceKey("public-feedback-threads-by-board-slug", { slug }));
};

// Feedback board invalidation
export const revalidateAllFeedbackBoardsResource = () => {
  revalidateTag(getResourceKey("feedback-boards"), {});
};

export const updateAllFeedbackBoardsResource = () => {
  updateTag(getResourceKey("feedback-boards"));
};

export const revalidateFeedbackBoardBySlugResource = (slug: string) => {
  revalidateTag(getResourceKey("feedback-board", { slug }), {});
};

export const updateFeedbackBoardBySlugResource = (slug: string) => {
  updateTag(getResourceKey("feedback-board", { slug }));
};

// Roadmap invalidation
export const revalidateAllRoadmapItemsResource = () => {
  revalidateTag(getResourceKey("all-roadmap-items"), {});
};

export const updateAllRoadmapItemsResource = () => {
  updateTag(getResourceKey("all-roadmap-items"));
};

export const revalidatePublishedRoadmapItemsResource = () => {
  revalidateTag(getResourceKey("published-roadmap-items"), {});
};

export const updatePublishedRoadmapItemsResource = () => {
  updateTag(getResourceKey("published-roadmap-items"));
};

export const revalidatePublicRoadmapFeedbackResource = () => {
  revalidateTag(getResourceKey("public-roadmap-feedback"), {});
};

export const updatePublicRoadmapFeedbackResource = () => {
  updateTag(getResourceKey("public-roadmap-feedback"));
};

// User notification invalidation
export const revalidateUserNotificationsResource = (userId: string) => {
  revalidateTag(getResourceKey("user-notifications", { userId }), {});
};

export const updateUserNotificationsResource = (userId: string) => {
  updateTag(getResourceKey("user-notifications", { userId }));
};

// User profile invalidation
export const revalidateUserProfileResource = (userId: string) => {
  revalidateTag(getResourceKey("user-profile", { userId }), {});
};

export const updateUserProfileResource = (userId: string) => {
  updateTag(getResourceKey("user-profile", { userId }));
};

// User invitations invalidation
export const revalidateUserInvitationsResource = (userId: string) => {
  revalidateTag(getResourceKey("user-invitations", { userId }), {});
};

export const updateUserInvitationsResource = (userId: string) => {
  updateTag(getResourceKey("user-invitations", { userId }));
};

// Workspace invalidation
export const revalidateWorkspacesResource = () => {
  revalidateTag(getResourceKey("workspaces"), {});
};

export const updateWorkspacesResource = () => {
  updateTag(getResourceKey("workspaces"));
};

export const revalidateWorkspaceResource = (id: string) => {
  revalidateTag(getResourceKey("workspace", { id }), {});
  revalidateTag(getResourceKey("workspaces"), {});
};

export const updateWorkspaceResource = (id: string) => {
  updateTag(getResourceKey("workspace", { id }));
  updateTag(getResourceKey("workspaces"));
};

export const revalidateWorkspaceBySlugResource = (slug: string) => {
  revalidateTag(getResourceKey("workspace-by-slug", { slug }), {});
  revalidateTag(getResourceKey("workspaces"), {});
};

export const updateWorkspaceBySlugResource = (slug: string) => {
  updateTag(getResourceKey("workspace-by-slug", { slug }));
  updateTag(getResourceKey("workspaces"));
};

export const revalidateWorkspaceMembersResource = (workspaceId: string) => {
  revalidateTag(getResourceKey("workspace-members", { workspaceId }), {});
  revalidateTag(getResourceKey("workspace", { id: workspaceId }), {});
};

export const updateWorkspaceMembersResource = (workspaceId: string) => {
  updateTag(getResourceKey("workspace-members", { workspaceId }));
  updateTag(getResourceKey("workspace", { id: workspaceId }));
};

export const revalidateWorkspaceInvitationsResource = (workspaceId: string) => {
  revalidateTag(getResourceKey("workspace-invitations", { workspaceId }), {});
  revalidateTag(getResourceKey("workspace", { id: workspaceId }), {});
};

export const updateWorkspaceInvitationsResource = (workspaceId: string) => {
  updateTag(getResourceKey("workspace-invitations", { workspaceId }));
  updateTag(getResourceKey("workspace", { id: workspaceId }));
};

// Project invalidation
export const revalidateProjectsResource = (workspaceId: string) => {
  revalidateTag(getResourceKey("projects", { workspaceId }), {});
};

export const updateProjectsResource = (workspaceId: string) => {
  updateTag(getResourceKey("projects", { workspaceId }));
};

export const revalidateProjectResource = (id: string, workspaceId?: string) => {
  revalidateTag(getResourceKey("project", { id }), {});
  if (workspaceId) {
    revalidateTag(getResourceKey("projects", { workspaceId }), {});
  }
};

export const updateProjectResource = (id: string, workspaceId?: string) => {
  updateTag(getResourceKey("project", { id }));
  if (workspaceId) {
    updateTag(getResourceKey("projects", { workspaceId }));
  }
};

export const revalidateProjectBySlugResource = (
  slug: string,
  workspaceId?: string
) => {
  revalidateTag(getResourceKey("project-by-slug", { slug }), {});
  if (workspaceId) {
    revalidateTag(getResourceKey("projects", { workspaceId }), {});
  }
};

export const updateProjectBySlugResource = (
  slug: string,
  workspaceId?: string
) => {
  updateTag(getResourceKey("project-by-slug", { slug }));
  if (workspaceId) {
    updateTag(getResourceKey("projects", { workspaceId }));
  }
};

export const revalidateProjectCommentsResource = (projectId: string) => {
  revalidateTag(getResourceKey("project-comments", { projectId }), {});
  revalidateTag(getResourceKey("project", { id: projectId }), {});
};

export const updateProjectCommentsResource = (projectId: string) => {
  updateTag(getResourceKey("project-comments", { projectId }));
  updateTag(getResourceKey("project", { id: projectId }));
};

export const revalidateProjectMembersResource = (projectId: string) => {
  revalidateTag(getResourceKey("project-members", { projectId }), {});
  revalidateTag(getResourceKey("project", { id: projectId }), {});
};

export const updateProjectMembersResource = (projectId: string) => {
  updateTag(getResourceKey("project-members", { projectId }));
  updateTag(getResourceKey("project", { id: projectId }));
};

// Billing invalidation
export const revalidateStripeProductsResource = () => {
  revalidateTag(getResourceKey("stripe-products"), {});
};

export const updateStripeProductsResource = () => {
  updateTag(getResourceKey("stripe-products"));
};

export const revalidateWorkspaceSubscriptionResource = (
  workspaceId: string
) => {
  revalidateTag(getResourceKey("workspace-subscription", { workspaceId }), {});
  revalidateTag(getResourceKey("workspace", { id: workspaceId }), {});
};

export const updateWorkspaceSubscriptionResource = (workspaceId: string) => {
  updateTag(getResourceKey("workspace-subscription", { workspaceId }));
  updateTag(getResourceKey("workspace", { id: workspaceId }));
};
