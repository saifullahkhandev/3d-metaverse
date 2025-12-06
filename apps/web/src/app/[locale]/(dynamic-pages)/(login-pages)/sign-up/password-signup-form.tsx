"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthFormInput } from "@/components/auth-form-components/auth-form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signUpWithPasswordAction } from "@/data/auth/auth";
import { getSafeActionErrorMessage } from "@/utils/error-message";
import {
  type SignUpWithPasswordSchemaType,
  signUpWithPasswordSchema,
} from "@/utils/zod-schemas/auth";

interface PasswordSignupFormProps {
  next?: string;
  setSuccessMessage: (message: string) => void;
}

export function PasswordSignupForm({
  next,
  setSuccessMessage,
}: PasswordSignupFormProps) {
  const toastRef = useRef<string | number | undefined>(undefined);

  const signUpWithPasswordMutation = useAction(signUpWithPasswordAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Creating account...");
    },
    onSuccess: ({ data }) => {
      toast.success("Account created!", { id: toastRef.current });
      toastRef.current = undefined;
      setSuccessMessage("A confirmation link has been sent to your email!");
    },
    onError: ({ error }) => {
      const errorMessage = getSafeActionErrorMessage(
        error,
        "Failed to create account"
      );
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
    },
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof signUpWithPasswordSchema
  >(signUpWithPasswordMutation.result.validationErrors, { joinBy: "\n" });

  const { execute: executeSignUp, status: signUpStatus } =
    signUpWithPasswordMutation;

  const form = useForm<SignUpWithPasswordSchemaType>({
    resolver: zodResolver(signUpWithPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      next,
    },
    errors: hookFormValidationErrors,
  });

  const { handleSubmit, control } = form;

  const onSubmit = (data: SignUpWithPasswordSchemaType) => {
    executeSignUp({ ...data, next });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthFormInput
          control={control}
          id="email"
          inputProps={{
            autoComplete: "email",
          }}
          name="email"
          placeholder="Email"
          type="email"
        />
        <AuthFormInput
          control={control}
          id="password"
          inputProps={{
            autoComplete: "new-password",
          }}
          name="password"
          placeholder="Password"
          type="password"
        />
        <Button disabled={signUpStatus === "executing"} type="submit">
          {signUpStatus === "executing" ? "Signing up..." : "Sign up"}
        </Button>
        <div className="w-full text-center">
          <div className="text-sm">
            <Link
              className="font-medium text-muted-foreground hover:text-foreground"
              href="/login"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
