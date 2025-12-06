"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form-components/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { type AvatarStyle, getAllAvatarOptions } from "@/utils/generate-avatar";
import { profileUpdateFormSchema } from "@/utils/zod-schemas/profile";
import { useOnboarding } from "./onboarding-context";

export function ProfileUpdate() {
  const {
    userProfile,
    userEmail,
    state,
    avatarUrl,
    updateProfile,
    updateAvatar,
    uploadAvatar,
    goBack,
  } = useOnboarding();

  const [selectedAvatarStyle, setSelectedAvatarStyle] =
    useState<AvatarStyle>("initials");
  const [avatarOptions, setAvatarOptions] = useState<
    Array<{ style: AvatarStyle; dataUri: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(profileUpdateFormSchema),
    defaultValues: {
      fullName: userProfile.full_name ?? "",
    },
  });

  const { handleSubmit, control, watch } = form;
  const fullNameValue = watch("fullName");

  // Generate avatar options based on email
  useEffect(() => {
    if (userEmail) {
      const options = getAllAvatarOptions(userEmail);
      setAvatarOptions(options);
      // Set initial avatar if not already set
      if (!avatarUrl) {
        updateAvatar(options[0].dataUri);
      }
    }
  }, [userEmail]);

  const handleAvatarSelect = (style: AvatarStyle, dataUri: string) => {
    setSelectedAvatarStyle(style);
    updateAvatar(dataUri);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: { fullName: string }) => {
    await updateProfile(data.fullName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-2xl text-foreground">
          Complete Your Profile
        </h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself and choose an avatar
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Full name input */}
          <div>
            <FormInput
              control={control}
              data-testid="full-name-input"
              id="full-name"
              label="Full Name"
              name="fullName"
            />
          </div>

          {/* Avatar selection */}
          <div className="space-y-3">
            <label
              className="font-medium text-foreground text-sm"
              htmlFor="avatar-select"
            >
              Choose Avatar
            </label>

            {/* Avatar options grid */}
            <div className="grid grid-cols-5 gap-3">
              {avatarOptions.map((option) => (
                <button
                  className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedAvatarStyle === option.style &&
                    !avatarUrl?.startsWith("http")
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                  key={option.style}
                  onClick={() =>
                    handleAvatarSelect(option.style, option.dataUri)
                  }
                  type="button"
                >
                  <Image
                    alt={`${option.style} avatar`}
                    className="rounded-md object-cover"
                    fill
                    src={option.dataUri}
                  />
                </button>
              ))}
            </div>

            {/* Upload option */}
            <Card className="border-dashed p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-1 font-medium text-foreground text-sm">
                    Or upload your own
                  </div>
                  <div className="text-muted-foreground text-xs">
                    JPG, PNG or GIF (max. 2MB)
                  </div>
                </div>
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={state.isLoading}
                  id="avatar-upload"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                <Button
                  data-testid="upload-avatar-button"
                  disabled={state.isLoading}
                  onClick={handleAvatarButtonClick}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Upload Photo
                </Button>
              </div>
            </Card>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              disabled={state.isLoading || !state.completedSteps.has(1)}
              onClick={goBack}
              type="button"
              variant="outline"
            >
              Back
            </Button>
            <Button
              data-testid="save-profile-button"
              disabled={state.isLoading || !fullNameValue.trim()}
              size="lg"
              type="submit"
            >
              {state.isLoading ? "Saving..." : "Continue"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
