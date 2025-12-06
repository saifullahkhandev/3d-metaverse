"use client";

import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { toast } from "sonner";
import { Password } from "@/components/authentication/password";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updatePasswordAction } from "@/data/user/security";
import { useRouter } from "@/i18n/navigation";
import { getSafeActionErrorMessage } from "@/utils/error-message";

export function UpdatePassword() {
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute, status } = useAction(updatePasswordAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Updating password...");
    },
    onSuccess: () => {
      toast.success("Password updated!", {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      router.push("/auth/callback");
    },
    onError: ({ error }) => {
      const errorMessage = getSafeActionErrorMessage(
        error,
        "Failed to update password"
      );
      toast.error(errorMessage, {
        id: toastRef.current,
      });
      toastRef.current = undefined;
    },
  });

  return (
    <div className="container mx-auto grid h-full max-w-lg items-center overflow-auto text-left">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle data-testid="update-password-title">
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your email to receive a Magic Link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Password
              buttonLabel="Confirm Password"
              isLoading={status === "executing"}
              label="Create your new Password"
              onSubmit={(password: string) => execute({ password })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
