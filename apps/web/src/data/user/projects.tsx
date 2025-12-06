"use server";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabase-admin-client";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/create-supabase-user-server-action-client";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/create-supabase-user-server-component-client";
import { userCache } from "@/typed-cache-tags";
import type { CommentWithUser } from "@/types";
import { normalizeComment } from "@/utils/comments";

export async function getSlimProjectById(projectId: string) {
  "use cache: private";
  userCache.data.projects.byId({ id: projectId }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id,name,project_status,workspace_id,slug")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export const getSlimProjectBySlug = async (projectSlug: string) => {
  "use cache: private";
  userCache.data.projects.bySlug({ slug: projectSlug }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id, slug, name")
    .eq("slug", projectSlug)
    .single();
  if (error) {
    console.log("getslimprojectbyslug", error);
    throw error;
  }
  return data;
};

export async function getProjectById(projectId: string) {
  "use cache: private";
  userCache.data.projects.byId({ id: projectId }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export async function getProjectBySlug(projectSlug: string) {
  "use cache: private";
  userCache.data.projects.bySlug({ slug: projectSlug }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .eq("slug", projectSlug)
    .single();
  if (error) {
    console.log("getprojectbyslug", error, projectSlug);
    throw error;
  }
  return data;
}

export async function getProjectTitleById(projectId: string) {
  "use cache: private";
  userCache.data.projects.byId({ id: projectId }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data.name;
}

export const getProjectComments = async (
  projectId: string
): Promise<Array<CommentWithUser>> => {
  "use cache: private";
  userCache.data.projects.comments({ projectId }).cacheTag();
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("project_comments")
    .select("*, user_profiles(*)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }

  return data.map(normalizeComment);
};
const createProjectCommentSchema = z.object({
  projectId: z.string(),
  projectSlug: z.string(),
  text: z.string(),
});

export const createProjectCommentAction = authActionClient
  .schema(createProjectCommentSchema)
  .action(
    async ({
      parsedInput: { projectId, projectSlug, text },
      ctx: { userId },
    }) => {
      const supabaseClient = await createSupabaseUserServerActionClient();

      const { data, error } = await supabaseClient
        .from("project_comments")
        .insert({ project_id: projectId, text, user_id: userId })
        .select("*, user_profiles(*)")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      userCache.data.projects.comments({ projectId }).update();

      return {
        comment: normalizeComment(data),
      };
    }
  );

const approveProjectSchema = z.object({
  projectId: z.uuid(),
  projectSlug: z.string(),
});

export const approveProjectAction = authActionClient
  .schema(approveProjectSchema)
  .action(async ({ parsedInput: { projectId, projectSlug } }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();

    const { data, error } = await supabaseClient
      .from("projects")
      .update({ project_status: "approved" })
      .eq("id", projectId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    userCache.data.projects.byId({ id: projectId }).update();
    userCache.data.workspaces
      .projects({ workspaceId: data.workspace_id })
      .update();
    return data;
  });

const rejectProjectSchema = z.object({
  projectId: z.uuid(),
  projectSlug: z.string(),
});

export const rejectProjectAction = authActionClient
  .schema(rejectProjectSchema)
  .action(async ({ parsedInput: { projectId, projectSlug } }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();

    const { data, error } = await supabaseClient
      .from("projects")
      .update({ project_status: "draft" })
      .eq("id", projectId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    userCache.data.projects.byId({ id: projectId }).update();
    userCache.data.workspaces
      .projects({ workspaceId: data.workspace_id })
      .update();
    return data;
  });
const submitProjectForApprovalSchema = z.object({
  projectId: z.uuid(),
  projectSlug: z.string(),
});

export const submitProjectForApprovalAction = authActionClient
  .schema(submitProjectForApprovalSchema)
  .action(async ({ parsedInput: { projectId, projectSlug } }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();

    const { data, error } = await supabaseClient
      .from("projects")
      .update({ project_status: "pending_approval" })
      .eq("id", projectId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    userCache.data.projects.byId({ id: projectId }).update();
    userCache.data.workspaces
      .projects({ workspaceId: data.workspace_id })
      .update();
    return data;
  });

const markProjectAsCompletedSchema = z.object({
  projectId: z.uuid(),
  projectSlug: z.string(),
});

export const markProjectAsCompletedAction = authActionClient
  .schema(markProjectAsCompletedSchema)
  .action(async ({ parsedInput: { projectId, projectSlug } }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();

    const { data, error } = await supabaseClient
      .from("projects")
      .update({ project_status: "completed" })
      .eq("id", projectId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    userCache.data.projects.byId({ id: projectId }).update();
    userCache.data.workspaces
      .projects({ workspaceId: data.workspace_id })
      .update();
    return data;
  });
export const getProjects = async ({
  workspaceId,
  query = "",
  page = 1,
  limit = 5,
}: {
  query?: string;
  page?: number;
  workspaceId: string;
  limit?: number;
}) => {
  "use cache: private";
  userCache.data.workspaces.projects({ workspaceId }).cacheTag();
  const zeroIndexedPage = page - 1;
  const supabase = await createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1)
    .order("created_at", { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getProjectsTotalCount = async ({
  workspaceId,
  query = "",
  page = 1,
  limit = 5,
}: {
  workspaceId: string;
  query?: string;
  page?: number;
  limit?: number;
}) => {
  "use cache: private";
  userCache.data.workspaces.projects({ workspaceId }).cacheTag();
  const zeroIndexedPage = page - 1;
  let supabaseQuery = supabaseAdminClient
    .from("projects")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("workspace_id", workspaceId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { count, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  if (!count) {
    return 0;
  }

  return Math.ceil(count / limit) ?? 0;
};

export async function getSlimProjectByIdForWorkspace(projectId: string) {
  "use cache: private";
  userCache.data.projects.byId({ id: projectId }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id,name,project_status,workspace_id,slug")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export const getSlimProjectBySlugForWorkspace = async (projectSlug: string) => {
  "use cache: private";
  userCache.data.projects.bySlug({ slug: projectSlug }).cacheTag();
  const supabaseClient = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id, slug, name")
    .eq("slug", projectSlug)
    .single();
  if (error) {
    throw error;
  }
  return data;
};

const createProjectSchema = z.object({
  workspaceId: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export const createProjectAction = authActionClient
  .schema(createProjectSchema)
  .action(async ({ parsedInput: { workspaceId, name, slug } }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();

    const { data: project, error } = await supabaseClient
      .from("projects")
      .insert({
        workspace_id: workspaceId,
        name,
        slug,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    userCache.data.workspaces.projects({ workspaceId }).update();
    return project;
  });

export const getProjectsForWorkspace = async ({
  workspaceId,
  query = "",
  page = 1,
  limit = 5,
}: {
  query?: string;
  page?: number;
  workspaceId: string;
  limit?: number;
}) => {
  "use cache: private";
  userCache.data.workspaces.projects({ workspaceId }).cacheTag();
  const zeroIndexedPage = page - 1;
  const supabase = await createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getProjectsTotalCountForWorkspace = async ({
  workspaceId,
  query = "",
  page = 1,
  limit = 5,
}: {
  workspaceId: string;
  query?: string;
  page?: number;
  limit?: number;
}) => {
  "use cache: private";
  userCache.data.workspaces.projects({ workspaceId }).cacheTag();
  const zeroIndexedPage = page - 1;
  let supabaseQuery = supabaseAdminClient
    .from("projects")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("workspace_id", workspaceId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { count, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  if (!count) {
    return 0;
  }

  return Math.ceil(count / limit) ?? 0;
};

const deleteProjectsSchema = z.object({
  projectIds: z.array(z.string()),
});

export const deleteProjectsAction = authActionClient
  .schema(deleteProjectsSchema)
  .action(async ({ parsedInput: { projectIds } }) => {
    const supabase = await createSupabaseUserServerActionClient();

    // Get workspace IDs before deleting
    const { data: projects } = await supabase
      .from("projects")
      .select("workspace_id")
      .in("id", projectIds);

    const { error } = await supabase
      .from("projects")
      .delete()
      .in("id", projectIds);

    if (error) {
      throw new Error(error.message);
    }

    // Invalidate all affected workspaces
    if (projects) {
      const uniqueWorkspaceIds = [
        ...new Set(projects.map((p) => p.workspace_id)),
      ];
      for (const workspaceId of uniqueWorkspaceIds) {
        userCache.data.workspaces.projects({ workspaceId }).update();
      }
    }

    return { success: true };
  });

const updateProjectSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, "Project name is required"),
  project_status: z.enum([
    "draft",
    "pending_approval",
    "approved",
    "completed",
  ]),
});

export const updateProjectAction = authActionClient
  .schema(updateProjectSchema)
  .action(async ({ parsedInput: { projectId, name, project_status } }) => {
    const supabase = await createSupabaseUserServerActionClient();

    // Get workspace ID first
    const { data: project } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", projectId)
      .single();

    const { error } = await supabase
      .from("projects")
      .update({
        name,
        project_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      throw new Error(error.message);
    }

    if (project) {
      userCache.data.projects.byId({ id: projectId }).update();
      userCache.data.workspaces
        .projects({ workspaceId: project.workspace_id })
        .update();
    }

    return { success: true };
  });
