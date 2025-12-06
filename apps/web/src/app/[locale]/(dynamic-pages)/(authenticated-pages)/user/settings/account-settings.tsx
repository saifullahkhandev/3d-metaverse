"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import Image from "next/image";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormInput } from "@/components/form-components/form-input";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  updateUserFullNameAction,
  uploadPublicUserAvatarAction,
} from "@/data/user/user";
import { useRouter } from "@/i18n/navigation";
import type { DBTable } from "@/types";
import { getUserAvatarUrl } from "@/utils/helpers";
import { profileUpdateFormSchema } from "@/utils/zod-schemas/profile";
import { ConfirmDeleteAccountDialog } from "./confirm-delete-account-dialog";

export function AccountSettings({
  userProfile,
  userEmail,
}: {
  userProfile: DBTable<"user_profiles">;
  userEmail: string | undefined;
}) {
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    userProfile.avatar_url ?? undefined
  );

  const {
    execute: updateUserName,
    status: updateNameStatus,
    result: updateNameResult,
  } = useOptimisticAction(updateUserFullNameAction, {
    currentState: userProfile.full_name ?? "",
    updateFn: (_, { fullName }) => fullName,
    onExecute: () => {
      toastRef.current = toast.loading("Updating name...");
    },
    onSuccess: () => {
      toast.success("Name updated!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? "Failed to update name";
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const { execute: uploadAvatar, status: uploadAvatarStatus } =
    useOptimisticAction(uploadPublicUserAvatarAction, {
      onExecute: () => {
        toastRef.current = toast.loading("Uploading avatar...");
      },
      onSuccess: ({ data }) => {
        setAvatarUrl(data);
        toast.success("Avatar uploaded!", {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? "Failed to upload avatar";
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
      currentState: avatarUrl,
      updateFn: (_, { formData }) => {
        try {
          const file = formData.get("file");
          if (file instanceof File) {
            return URL.createObjectURL(file);
          }
        } catch (error) {
          console.error(error);
        }
        return avatarUrl;
      },
    });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof profileUpdateFormSchema
  >(updateNameResult.validationErrors, { joinBy: "\n" });

  const form = useForm({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      fullName: userProfile.full_name ?? "",
    },
    errors: hookFormValidationErrors,
  });

  const { handleSubmit, control } = form;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      uploadAvatar({
        formData,
        fileName: file.name,
        fileOptions: {
          upsert: true,
        },
      });
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const avatarUrlWithFallback = getUserAvatarUrl({
    profileAvatarUrl: avatarUrl ?? userProfile.avatar_url,
    email: userEmail,
  });

  return (
    <div className="max-w-sm">
      <div className="space-y-16">
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={handleSubmit(updateUserName)}
              >
                <div className="space-y-2">
                  <label className="font-medium text-sm" htmlFor="avatar">
                    Avatar
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative h-12 w-12 shrink-0">
                      <Image
                        alt="User avatar"
                        className="rounded-full object-cover"
                        fill
                        src={avatarUrlWithFallback}
                      />
                    </div>
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={uploadAvatarStatus === "executing"}
                      id="avatar-upload"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      type="file"
                    />
                    <Button
                      disabled={uploadAvatarStatus === "executing"}
                      onClick={handleAvatarButtonClick}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {uploadAvatarStatus === "executing"
                        ? "Uploading..."
                        : "Change Avatar"}
                    </Button>
                  </div>
                </div>
                <FormInput
                  control={control}
                  id="full-name"
                  label="Full Name"
                  name="fullName"
                />
                <Button
                  disabled={
                    updateNameStatus === "executing" ||
                    uploadAvatarStatus === "executing"
                  }
                  type="submit"
                >
                  {updateNameStatus === "executing" ? "Saving..." : "Save Name"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="space-y-2">
          <PageHeading
            subTitle="Delete your account. This action is irreversible. All your data will be lost."
            subTitleClassName="text-base -mt-1"
            title="Danger zone"
            titleClassName="text-xl"
          />
          <ConfirmDeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}
