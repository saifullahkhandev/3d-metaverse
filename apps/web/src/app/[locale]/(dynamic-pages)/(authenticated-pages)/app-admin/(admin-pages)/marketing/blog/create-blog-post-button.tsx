// @/app/[locale]/(dynamic-pages)/(authenticated-pages)/app-admin/(admin-pages)/marketing/blog/CreateBlogPostButton.tsx
"use client";
import Chance from "chance";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import type React from "react";
import slugify from "slugify";
import { Button } from "@/components/ui/button";
import { createBlogPostAction } from "@/data/admin/marketing-blog";

export const CreateBlogPostButton: React.FC = () => {
  const createPostMutation = useAction(createBlogPostAction, {});

  const handleCreatePost = () => {
    const chance = new Chance();
    const random = chance.integer({ min: 100_000, max: 999_999 });
    const title = "Draft-" + format(new Date(), "dd-MMMM-yyyy") + `-${random}`;
    const slug = slugify(title, {
      lower: true,
      strict: true,
      replacement: "-",
    });

    createPostMutation.execute({
      title,
      slug,
      summary: "This is a draft blog post",
      content: "This is a draft blog post",
      stringified_json_content: JSON.stringify({}),
      stringified_seo_data: JSON.stringify({}),
      status: "draft",
    });
  };

  return (
    <Button
      disabled={createPostMutation.status === "executing"}
      onClick={handleCreatePost}
    >
      <Plus className="mr-2 h-4 w-4" />
      Create Blog Post
    </Button>
  );
};
