"use server";

import urlJoin from "url-join";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { redirect } from "@/i18n/navigation";
import { adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabase-admin-client";
import { commonPublicCache, superAdminCache } from "@/typed-cache-tags";
import { serverGetRefererLocale } from "@/utils/server/server-get-referer-locale";
import {
  createMarketingChangelogActionSchema,
  deleteMarketingChangelogSchema,
  updateChangelogAuthorsSchema,
  updateMarketingChangelogActionSchema,
} from "@/utils/zod-schemas/marketing-changelog";

export const createChangelogAction = adminActionClient
  .schema(createMarketingChangelogActionSchema)
  .action(async ({ parsedInput }) => {
    const { stringified_json_content, ...createData } = parsedInput;
    const jsonContent = JSON.parse(stringified_json_content);
    const { data, error } = await supabaseAdminClient
      .from("marketing_changelog")
      .insert({
        ...createData,
        json_content: jsonContent,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Always invalidate admin cache
    superAdminCache.data.changelog.list.update();
    // Only invalidate public cache if published
    if (data.status === "published") {
      commonPublicCache.data.changelog.list.update();
    }
    const locale = await serverGetRefererLocale();
    redirect({
      href: `/app-admin/marketing/changelog/${data.id}`,
      locale,
    });
  });

export const updateChangelogAction = adminActionClient
  .schema(updateMarketingChangelogActionSchema)
  .action(async ({ parsedInput }) => {
    const { id, stringified_json_content, ...updateData } = parsedInput;

    // Fetch old status before update
    const { data: oldChangelog } = await supabaseAdminClient
      .from("marketing_changelog")
      .select("status")
      .eq("id", id)
      .single();

    const jsonContent = JSON.parse(stringified_json_content);
    const { data, error } = await supabaseAdminClient
      .from("marketing_changelog")
      .update({
        ...updateData,
        json_content: jsonContent,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Always invalidate admin cache and individual item
    superAdminCache.data.changelog.list.update();
    superAdminCache.data.changelog.itemById({ id }).update();
    // Invalidate public cache if old OR new status is published
    if (oldChangelog?.status === "published" || data.status === "published") {
      commonPublicCache.data.changelog.list.update();
    }
    return data;
  });

export const deleteChangelogAction = adminActionClient
  .schema(deleteMarketingChangelogSchema)
  .action(async ({ parsedInput: { id } }) => {
    // Fetch status before deleting
    const { data: changelogData } = await supabaseAdminClient
      .from("marketing_changelog")
      .select("status")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdminClient
      .from("marketing_changelog")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    // Always invalidate admin cache and individual item
    superAdminCache.data.changelog.list.update();
    superAdminCache.data.changelog.itemById({ id }).update();
    // If was published, invalidate public cache
    if (changelogData?.status === "published") {
      commonPublicCache.data.changelog.list.update();
    }
    return { message: "Changelog deleted successfully" };
  });

export const updateChangelogAuthorsAction = adminActionClient
  .schema(updateChangelogAuthorsSchema)
  .action(async ({ parsedInput: { changelogId, authorIds } }) => {
    // Fetch changelog status before updating authors
    const { data: changelogData } = await supabaseAdminClient
      .from("marketing_changelog")
      .select("status")
      .eq("id", changelogId)
      .single();

    const { error: deleteError } = await supabaseAdminClient
      .from("marketing_changelog_author_relationship")
      .delete()
      .eq("changelog_id", changelogId);

    if (deleteError) throw new Error(deleteError.message);

    const authorRelations = authorIds.map((authorId) => ({
      changelog_id: changelogId,
      author_id: authorId,
    }));

    const { error: insertError } = await supabaseAdminClient
      .from("marketing_changelog_author_relationship")
      .insert(authorRelations);

    if (insertError) throw new Error(insertError.message);

    // Always invalidate admin cache and individual item
    superAdminCache.data.changelog.list.update();
    superAdminCache.data.changelog.itemById({ id: changelogId }).update();
    // Only invalidate public cache if published
    if (changelogData?.status === "published") {
      commonPublicCache.data.changelog.list.update();
    }
    return { message: "Changelog authors updated successfully" };
  });

export async function getAllChangelogs() {
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

export async function getChangelogById(id: string) {
  const { data, error } = await supabaseAdminClient
    .from("marketing_changelog")
    .select(
      `
      *,
      marketing_changelog_author_relationship(author_id)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

const formDataSchema = zfd.formData({
  file: zfd.file(),
});

const uploadChangelogCoverImageSchema = z.object({
  formData: formDataSchema,
});

export const uploadChangelogCoverImageAction = adminActionClient
  .schema(uploadChangelogCoverImageSchema)
  .action(async ({ parsedInput: { formData } }) => {
    const { file } = formData;

    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const changelogImagesPath = `marketing/changelog-images/${uniqueFilename}`;

    const { data, error } = await supabaseAdminClient.storage
      .from("marketing-assets")
      .upload(changelogImagesPath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { path } = data;

    const filePath = path.split(",")[0];
    const supabaseFileUrl = urlJoin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "/storage/v1/object/public/marketing-assets",
      filePath
    );

    return supabaseFileUrl;
  });

// New action for uploading changelog media (images, videos, GIFs)
const uploadChangelogMediaSchema = z.object({
  formData: formDataSchema,
});

function getMediaTypeFromFile(file: File): "image" | "video" | "gif" {
  const mimeType = file.type.toLowerCase();

  if (mimeType === "image/gif") {
    return "gif";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  return "image";
}

export const uploadChangelogMediaAction = adminActionClient
  .schema(uploadChangelogMediaSchema)
  .action(async ({ parsedInput: { formData } }) => {
    const { file } = formData;

    // Validate file type
    const mimeType = file.type.toLowerCase();
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(
        `Invalid file type: ${mimeType}. Allowed types: images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV)`
      );
    }

    // Validate file size (100MB max for videos, 10MB for images/gifs)
    const maxSizeBytes = mimeType.startsWith("video/")
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024);
      throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
    }

    const mediaType = getMediaTypeFromFile(file);
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const mediaPath = `marketing/changelog-media/${uniqueFilename}`;

    const { data, error } = await supabaseAdminClient.storage
      .from("marketing-assets")
      .upload(mediaPath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { path } = data;
    const filePath = path.split(",")[0];
    const supabaseFileUrl = urlJoin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "/storage/v1/object/public/marketing-assets",
      filePath
    );

    return {
      url: supabaseFileUrl,
      type: mediaType,
    };
  });
