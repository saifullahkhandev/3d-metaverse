"use client";

import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmailConfirmationPendingCard } from "@/components/authentication/email-confirmation-pending-card";
import { RedirectingPleaseWaitCard } from "@/components/authentication/redirecting-please-wait-card";
import { RenderProviders } from "@/components/authentication/render-providers";
import { Link } from "@/components/intl-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithProviderAction } from "@/data/auth/auth";
import { useRouter } from "@/i18n/navigation";
import { MagicLinkLoginForm } from "./magic-link-login-form";
import { PasswordLoginForm } from "./password-login-form";

export function Login({
  next,
  nextActionType,
}: {
  next?: string;
  nextActionType?: string;
}) {
  const [emailSentSuccessMessage, setEmailSentSuccessMessage] = useState<
    string | null
  >(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);

  function redirectToDashboard() {
    if (next) {
      router.push(`/auth/callback?next=${next}`);
    } else {
      router.push("/dashboard");
    }
  }

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading("Requesting login...");
      },
      onSuccess: ({ data }) => {
        if (data) {
          toast.success("Redirecting...", {
            id: toastRef.current,
          });
          toastRef.current = undefined;
          window.location.href = data.url;
        }
      },
      onError: (error) => {
        toast.error("Failed to login", {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  if (emailSentSuccessMessage) {
    return (
      <EmailConfirmationPendingCard
        heading={"Confirmation Link Sent"}
        message={emailSentSuccessMessage}
        resetSuccessMessage={setEmailSentSuccessMessage}
        type={"login"}
      />
    );
  }

  if (redirectInProgress) {
    return (
      <RedirectingPleaseWaitCard
        heading="Redirecting to Dashboard"
        message="Please wait while we redirect you to your dashboard."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to Your Account</CardTitle>
        <CardDescription>Choose your preferred login method</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>
          <TabsContent value="password">
            <PasswordLoginForm
              next={next}
              redirectToDashboard={redirectToDashboard}
              setRedirectInProgress={setRedirectInProgress}
            />
          </TabsContent>

          <TabsContent value="magic-link">
            <MagicLinkLoginForm
              next={next}
              setEmailSentSuccessMessage={setEmailSentSuccessMessage}
            />
          </TabsContent>
        </Tabs>
        <Separator className="my-4" />
        <RenderProviders
          isLoading={providerStatus === "executing"}
          onProviderLoginRequested={(provider) =>
            executeProvider({ provider, next })
          }
          providers={["google", "github", "twitter"]}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          className="text-blue-600 text-sm hover:underline"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
        <Link className="text-blue-600 text-sm hover:underline" href="/sign-up">
          Sign up instead
        </Link>
      </CardFooter>
    </Card>
  );
}
