"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EmailConfirmationPendingCard } from "@/components/authentication/email-confirmation-pending-card";
import { FormInput } from "@/components/form-components/form-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { T } from "@/components/ui/typography-ui";
import { resetPasswordAction } from "@/data/auth/auth";
import { getSafeActionErrorMessage } from "@/utils/error-message";
import {
  type ResetPasswordSchemaType,
  resetPasswordSchema,
} from "@/utils/zod-schemas/auth";

export function ForgotPassword() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const toastRef = useRef<string | number | undefined>(undefined);

  const resetPasswordMutation = useAction(resetPasswordAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Sending password reset link...");
    },
    onSuccess: () => {
      toast.success("Password reset link sent!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setSuccessMessage("A password reset link has been sent to your email!");
    },
    onError: ({ error }) => {
      const errorMessage = getSafeActionErrorMessage(
        error,
        "Failed to send password reset link"
      );
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof resetPasswordSchema
  >(resetPasswordMutation.result.validationErrors, { joinBy: "\n" });

  const { execute, status } = resetPasswordMutation;

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
    errors: hookFormValidationErrors,
  });

  const onSubmit = (data: ResetPasswordSchemaType) => {
    execute(data);
  };

  return (
    <>
      {successMessage ? (
        <EmailConfirmationPendingCard
          heading="Reset password link sent"
          message={successMessage}
          resetSuccessMessage={setSuccessMessage}
          type="reset-password"
        />
      ) : (
        <Card className="container mx-auto grid h-full max-w-lg items-center overflow-auto text-left">
          <CardHeader>
            <T.H4>Forgot Password</T.H4>
            <T.P className="text-muted-foreground">
              Enter your email to receive a Magic Link to reset your password.
            </T.P>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormInput
                  control={form.control}
                  id="forgot-password-email"
                  inputProps={{
                    placeholder: "placeholder@email.com",
                    disabled: status === "executing",
                    autoComplete: "email",
                  }}
                  label="Email address"
                  name="email"
                  type="email"
                />
                <Button disabled={status === "executing"} type="submit">
                  {status === "executing" ? "Sending..." : "Reset password"}
                </Button>
                <div className="text-center text-sm">
                  <Link
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    href="/login"
                  >
                    Log in instead?
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
