"use client";

import Chance from "chance";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import type React from "react";
import { useRef } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createTagAction } from "@/data/admin/marketing-tags";
import { useRouter } from "@/i18n/navigation";

export const CreateTagButton: React.FC = () => {
  const toastRef = useRef<string | number | undefined>(undefined);
  const router = useRouter();
  const chance = new Chance();

  const createTagMutation = useAction(createTagAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Creating tag...", {
        description: "Please wait while we create the tag.",
      });
    },
    onSuccess: ({ data }) => {
      toast.success("Tag created!", { id: toastRef.current });
      toastRef.current = undefined;
      if (data) {
        router.push(`/app-admin/marketing/tags/${data.id}`);
      }
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to create tag: ${error.serverError || "Unknown error"}`,
        { id: toastRef.current }
      );
      toastRef.current = undefined;
    },
  });

  const handleCreateTag = () => {
    const name = chance.word();
    const slug = slugify(name, { lower: true, strict: true });
    const description = chance.sentence();

    createTagMutation.execute({ name, slug, description });
  };

  return (
    <Button
      disabled={createTagMutation.status === "executing"}
      onClick={handleCreateTag}
    >
      <Plus className="mr-2 h-4 w-4" />
      Create Tag
    </Button>
  );
};
