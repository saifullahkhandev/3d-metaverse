"use client";
import { ArrowLeftIcon, Fingerprint, MailIcon } from "lucide-react";
import type React from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface IConfirmationPendingCardProps {
  message: string;
  heading: string;
  type: "login" | "sign-up" | "reset-password";
  resetSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  resendEmail?: () => void;
}

export function EmailConfirmationPendingCard({
  message,
  heading,
  type,
  resetSuccessMessage,
  resendEmail,
}: IConfirmationPendingCardProps) {
  const router = useRouter();
  return (
    <div
      className="mx-auto w-full max-w-md px-4"
      data-testid="email-confirmation-pending-card"
    >
      <Card className="w-full min-w-[320px] overflow-hidden border p-1 shadow-md">
        <CardHeader className="space-y-4 pt-8 pb-6">
          <div className="mx-auto w-fit rounded-full bg-muted/30 p-3">
            {type === "reset-password" ? (
              <Fingerprint className="h-8 w-8" />
            ) : (
              <MailIcon className="h-8 w-8" />
            )}
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-center font-semibold text-xl">
              {heading}
            </CardTitle>
            <CardDescription className="mx-auto max-w-xs text-center">
              {message}
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 pb-8">
          <Button
            className="mx-auto w-full max-w-xs"
            onClick={() => {
              resetSuccessMessage(null);
              router.push(
                type === "login"
                  ? "/login"
                  : type === "sign-up"
                    ? "/sign-up"
                    : "/login"
              );
            }}
            variant="secondary"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {type === "sign-up" ? "Back to sign up" : "Back to login"}
          </Button>
        </CardFooter>
      </Card>
      {type === "sign-up" && resendEmail && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Didn&apos;t receive the email?{" "}
            <Button
              className="px-0 font-medium underline underline-offset-4 hover:text-primary"
              onClick={resendEmail}
              variant="link"
            >
              Click to resend
            </Button>
          </p>
        </div>
      )}
    </div>
  );
}
