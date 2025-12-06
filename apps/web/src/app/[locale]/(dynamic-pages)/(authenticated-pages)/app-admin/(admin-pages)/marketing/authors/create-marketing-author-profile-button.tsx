// src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app-admin/(admin-pages)/marketing/authors/CreateMarketingAuthorProfileButton.tsx
"use client";

import Chance from "chance";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import type React from "react";
import { useRef } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAuthorProfileAction } from "@/data/admin/marketing-authors";
import { useRouter } from "@/i18n/navigation";

const avatars = [
  "/assets/cute-avatars/bear.jpg",
  "/assets/cute-avatars/deer.jpg",
  "/assets/cute-avatars/gs.jpg",
  "/assets/cute-avatars/fire-dragon.jpg",
  "/assets/cute-avatars/simba.png",
];

export const CreateMarketingAuthorProfileButton: React.FC = () => {
  const toastRef = useRef<string | number | undefined>(undefined);
  const router = useRouter();

  const createProfileMutation = useAction(createAuthorProfileAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Creating profile...", {
        description: "Please wait while we create the profile.",
      });
    },
    onSuccess: ({ data }) => {
      toast.success("Profile created!", { id: toastRef.current });
      toastRef.current = undefined;
      console.log(data);
      if (data) {
        router.push(`/app-admin/marketing/authors/${data.id}`);
      }
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to create profile: ${error.serverError || "Unknown error"}`,
        { id: toastRef.current }
      );
      toastRef.current = undefined;
    },
  });

  const handleCreateProfile = () => {
    const chance = new Chance();
    const displayName = chance.name();
    const slug = slugify(displayName, {
      lower: true,
      strict: true,
      replacement: "-",
    });
    const randomProfile = {
      display_name: displayName,
      slug,
      bio: chance.paragraph({ sentences: 1 }),
      avatar_url: chance.pickone(avatars),
      website_url: chance.url(),
    };

    createProfileMutation.execute(randomProfile);
  };

  return (
    <Button
      disabled={createProfileMutation.status === "executing"}
      onClick={handleCreateProfile}
    >
      <Plus className="mr-2 h-4 w-4" />
      Create Author Profile
    </Button>
  );
};
