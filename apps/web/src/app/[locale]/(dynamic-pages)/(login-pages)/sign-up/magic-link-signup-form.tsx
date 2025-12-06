"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthFormInput } from "@/components/auth-form-components/auth-form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signInWithMagicLinkAction } from "@/data/auth/auth";
import { getSafeActionErrorMessage } from "@/utils/error-message";
import {
  signInWithMagicLinkFormSchema,
  type signInWithMagicLinkFormSchemaType,
  type signInWithMagicLinkSchema,
} from "@/utils/zod-schemas/auth";

interface MagicLinkSignupFormProps {
  next?: string;
  setSuccessMessage: (message: string) => void;
}

export function MagicLinkSignupForm({
  next,
  setSuccessMessage,
}: MagicLinkSignupFormProps) {
  const toastRef = useRef<string | number | undefined>(undefined);

  const signInWithMagicLinkMutation = useAction(signInWithMagicLinkAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Sending magic link...");
    },
    onSuccess: () => {
      toast.success("A magic link has been sent to your email!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setSuccessMessage("A magic link has been sent to your email!");
    },
    onError: ({ error }) => {
      const errorMessage = getSafeActionErrorMessage(
        error,
        "Failed to send magic link"
      );
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
    },
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof signInWithMagicLinkSchema
  >(signInWithMagicLinkMutation.result.validationErrors, { joinBy: "\n" });

  const { execute: executeMagicLink, status: magicLinkStatus } =
    signInWithMagicLinkMutation;

  const form = useForm<signInWithMagicLinkFormSchemaType>({
    resolver: zodResolver(signInWithMagicLinkFormSchema),
    defaultValues: {
      email: "",
      shouldCreateUser: true,
      next,
    },
    errors: hookFormValidationErrors,
  });

  const { handleSubmit, control } = form;

  const onSubmit = (data: signInWithMagicLinkFormSchemaType) => {
    executeMagicLink(data);
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        data-testid="magic-link-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <AuthFormInput
          control={control}
          id="sign-up-email"
          inputProps={{
            disabled: magicLinkStatus === "executing",
            autoComplete: "email",
          }}
          name="email"
          placeholder="Email"
          type="email"
        />
        <Button disabled={magicLinkStatus === "executing"} type="submit">
          {magicLinkStatus === "executing"
            ? "Sending..."
            : "Sign up with Magic Link"}
        </Button>
      </form>
    </Form>
  );
}
