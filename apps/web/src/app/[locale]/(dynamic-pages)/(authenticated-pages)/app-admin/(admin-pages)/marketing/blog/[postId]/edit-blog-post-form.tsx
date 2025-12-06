// @/app/[locale]/(dynamic-pages)/(authenticated-pages)/app-admin/(admin-pages)/marketing/blog/[postId]/EditBlogPostForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Check, Loader, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTimeoutWhen } from "rooks";
import slugify from "slugify";
import { toast } from "sonner";
import type { z } from "zod";
import { FormInput } from "@/components/form-components/form-input";
import { FormSelect } from "@/components/form-components/form-select";
import { FormSwitch } from "@/components/form-components/form-switch";
import { FormTextarea } from "@/components/form-components/form-textarea";
import { Tiptap } from "@/components/tip-tap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  updateBlogPostAction,
  uploadBlogCoverImageAction,
} from "@/data/admin/marketing-blog";
import { useRouter } from "@/i18n/navigation";
import type { DBTable } from "@/types";
import { toSafeJSONB } from "@/utils/jsonb";
import { updateMarketingBlogPostSchema } from "@/utils/zod-schemas/marketing-blog";
import { AuthorsSelect } from "./authors-select";
import { TagsSelect } from "./tags-select";

type FormData = z.infer<typeof updateMarketingBlogPostSchema>;

type EditBlogPostFormProps = {
  post: DBTable<"marketing_blog_posts"> & {
    marketing_blog_author_posts?: { author_id: string }[];
    marketing_blog_post_tags_relationship?: { tag_id: string }[];
  };
  authors: DBTable<"marketing_author_profiles">[];
  tags: DBTable<"marketing_tags">[];
};

export function EditBlogPostForm({
  post,
  authors,
  tags,
}: EditBlogPostFormProps) {
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);
  const [coverImageUrl, setCoverImageUrl] = useState(post.cover_image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useAction(updateBlogPostAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Updating blog post...", {
        description: "Please wait while we update the post.",
      });
    },
    onSuccess: () => {
      toast.success("Blog post updated successfully", {
        description: "The blog post has been updated successfully.",
        id: toastRef.current,
      });
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to update blog post: ${error.serverError || "Unknown error"}`,
        {
          description: "Please try again.",
          id: toastRef.current,
        }
      );
    },
    onSettled: () => {
      toastRef.current = undefined;
    },
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof updateMarketingBlogPostSchema
  >(updateMutation.result.validationErrors, { joinBy: "\n" });

  const form = useForm<FormData>({
    resolver: zodResolver(updateMarketingBlogPostSchema),
    defaultValues: {
      ...post,
      json_content: toSafeJSONB(post.json_content),
      seo_data: toSafeJSONB(post.seo_data),
      cover_image: post.cover_image ?? undefined,
    },
    errors: hookFormValidationErrors,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = form;

  const currentTitle = watch("title");

  useEffect(() => {
    if (currentTitle) {
      setValue(
        "slug",
        slugify(currentTitle, {
          lower: true,
          strict: true,
          replacement: "-",
        })
      );
    }
  }, [currentTitle]);

  const uploadImageMutation = useAction(uploadBlogCoverImageAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Uploading cover image...", {
        description: "Please wait while we upload the image.",
      });
    },
    onSuccess: ({ data }) => {
      toast.success("Cover image uploaded successfully", {
        description: "The cover image has been uploaded successfully.",
        id: toastRef.current,
      });
      if (data) {
        setCoverImageUrl(data);
        setValue("cover_image", data);
      }
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to upload cover image: ${error.serverError || "Unknown error"}`,
        {
          description: "Please try again.",
          id: toastRef.current,
        }
      );
    },
    onSettled: () => {
      toastRef.current = undefined;
    },
  });

  const onSubmit = async ({ json_content, seo_data, ...data }: FormData) => {
    updateMutation.execute({
      ...data,
      stringified_json_content: JSON.stringify(json_content ?? {}),
      stringified_seo_data: JSON.stringify(seo_data ?? {}),
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      await uploadImageMutation.execute({ formData });
    }
  };

  const hasUpdateMutationSettled =
    updateMutation.status === "hasSucceeded" ||
    updateMutation.status === "hasErrored";
  useTimeoutWhen(
    () => {
      updateMutation.reset();
    },
    1500,
    hasUpdateMutationSettled
  );

  // Cover image upload UI component
  const CoverImageUI = () => (
    <div className="rounded-lg border bg-muted/30">
      <div
        className="relative mx-auto flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg p-3"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-full">
          <AspectRatio ratio={4 / 3}>
            {coverImageUrl ? (
              <div className="relative h-full w-full">
                <Image
                  alt="Cover image"
                  className="rounded-lg object-cover"
                  fill
                  src={coverImageUrl}
                />
                {/* Remove button */}
                <button
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImageUrl("");
                    setValue("cover_image", "");
                  }}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 transition-colors hover:border-muted-foreground/50">
                <Upload className="mb-1.5 h-6 w-6 text-muted-foreground" />
                <span className="font-medium text-muted-foreground text-xs">
                  Click to upload
                </span>
                <span className="mt-0.5 text-center text-muted-foreground text-xs">
                  Cover image
                </span>
              </div>
            )}
          </AspectRatio>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6" data-testid="blog-post-edit-header">
        <p className="text-muted-foreground text-sm">Editing Blog Post</p>
        <h1 className="font-bold text-3xl" data-testid="blog-post-edit-title">
          {currentTitle || "Untitled"}
        </h1>
      </div>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 md:flex-row"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Main content column */}
          <div className="grow space-y-6">
            {/* Title */}
            <FormInput
              control={control}
              description="This is the title of the blog post."
              id="title"
              label="Title"
              name="title"
            />

            {/* Slug */}
            <FormInput
              control={control}
              description="This is the slug of the blog post."
              id="slug"
              label="Slug"
              name="slug"
            />

            {/* Content Editor */}
            <div className="nextbase-editor max-w-full overflow-hidden">
              <Label htmlFor="json_content">Content</Label>
              <Controller
                control={control}
                name="json_content"
                render={({ field }) => (
                  <Tiptap
                    initialContent={field.value ?? {}}
                    onUpdate={({ editor }) => {
                      field.onChange(editor.getJSON());
                    }}
                  />
                )}
              />
            </div>

            {/* Summary - Accordion */}
            <Accordion className="rounded-lg border" collapsible type="single">
              <AccordionItem className="border-0" value="summary">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="font-medium text-sm">
                    Summary (Optional)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <FormTextarea
                    control={control}
                    description="A brief summary of the blog post."
                    id="summary"
                    label="Summary"
                    name="summary"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Mobile-only: Authors section */}
            <div className="md:hidden">
              <AuthorsSelect authors={authors} post={post} />
            </div>

            <Button disabled={updateMutation.status !== "idle"} type="submit">
              {updateMutation.status === "executing" ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : updateMutation.status === "hasSucceeded" ? (
                <>
                  <Check className="h-4 w-4" />
                  Updated!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Blog Post
                </>
              )}
            </Button>
          </div>

          {/* Sidebar */}
          <div className="order-first space-y-4 md:order-none md:w-72 md:shrink-0">
            {/* Mobile: Collapsible Cover Image */}
            <div className="md:hidden">
              <Accordion collapsible defaultValue="" type="single">
                <AccordionItem className="rounded-lg border" value="cover">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-sm">Cover Image</span>
                      {coverImageUrl && (
                        <img
                          alt="Preview"
                          className="h-6 w-6 rounded object-cover"
                          src={coverImageUrl}
                        />
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <CoverImageUI />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Desktop: Direct Cover Image */}
            <div className="hidden md:block">
              <Label className="text-sm">Cover Image</Label>
              <p className="mb-2 text-muted-foreground text-xs">
                Featured image for the blog post.
              </p>
              <CoverImageUI />
            </div>

            <input
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              ref={fileInputRef}
              type="file"
            />

            {errors.cover_image && (
              <p className="text-red-500 text-sm">
                {errors.cover_image.message}
              </p>
            )}

            {/* Status + Is Featured row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <FormSelect
                  control={control}
                  id="status"
                  label="Status"
                  name="status"
                  options={[
                    { label: "Draft", value: "draft" },
                    { label: "Published", value: "published" },
                  ]}
                  placeholder="Status"
                />
              </div>
              <div className="flex items-end pb-1">
                <FormSwitch
                  control={control}
                  id="is_featured"
                  label="Featured"
                  name="is_featured"
                />
              </div>
            </div>

            {/* Tags */}
            <TagsSelect post={post} tags={tags} />

            {/* Desktop-only: Authors section */}
            <div className="hidden md:block">
              <AuthorsSelect authors={authors} post={post} />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
