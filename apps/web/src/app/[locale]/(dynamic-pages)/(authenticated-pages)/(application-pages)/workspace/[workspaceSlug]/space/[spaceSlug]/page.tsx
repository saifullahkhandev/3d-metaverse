import type { Metadata } from "next";
import { getCachedUserProfile } from "@/rsc-data/user/user";
import { getCachedWorkspaceBySlug } from "@/rsc-data/user/workspaces";
import { spaceParamSchema } from "@/utils/zod-schemas/params";
import { SpaceSceneLoader } from "./_components/space-scene-loader";

/** Turn a slug ("quiet-garden") into a display name ("Quiet Garden"). */
function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata(props: {
  params: Promise<unknown>;
}): Promise<Metadata> {
  const params = await props.params;
  const { spaceSlug } = spaceParamSchema.parse(params);
  return {
    title: `${humanizeSlug(spaceSlug)} | Commons`,
  };
}

export default async function SpacePage(props: { params: Promise<unknown> }) {
  const params = await props.params;
  const { workspaceSlug, spaceSlug } = spaceParamSchema.parse(params);

  // Authorisation: this query runs through the user's RLS-scoped client, so a
  // non-member throws before any scene is rendered. (Phase 1 will also load the
  // space row + map_data here.)
  await getCachedWorkspaceBySlug(workspaceSlug);

  const profile = await getCachedUserProfile();
  const playerName = profile.full_name?.trim() || "You";

  return (
    <SpaceSceneLoader
      playerName={playerName}
      spaceName={humanizeSlug(spaceSlug)}
    />
  );
}
