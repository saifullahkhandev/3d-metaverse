"use client";

import { useState } from "react";
import { EmailConfirmationPendingCard } from "@/components/authentication/email-confirmation-pending-card";
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
import { MagicLinkSignupForm } from "./magic-link-signup-form";
import { PasswordSignupForm } from "./password-signup-form";
import { ProviderSignupForm } from "./provider-signup-form";

interface SignUpProps {
  next?: string;
  nextActionType?: string;
}

export function SignUp({ next, nextActionType }: SignUpProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <div
      className="container mx-auto min-h-[470px] max-w-lg items-center overflow-auto text-left data-success:flex data-success:h-full data-success:justify-center"
      data-success={successMessage}
    >
      {successMessage ? (
        <EmailConfirmationPendingCard
          heading="Confirmation Link Sent"
          message={successMessage}
          resetSuccessMessage={setSuccessMessage}
          type="sign-up"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create your Nextbase Account</CardTitle>
            <CardDescription>
              Choose your preferred signup method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <PasswordSignupForm
                  next={next}
                  setSuccessMessage={setSuccessMessage}
                />
              </TabsContent>
              <TabsContent value="magic-link">
                <MagicLinkSignupForm
                  next={next}
                  setSuccessMessage={setSuccessMessage}
                />
              </TabsContent>
            </Tabs>
            <Separator className="my-4" />
            <ProviderSignupForm next={next} />
          </CardContent>
          <CardFooter>
            <div className="w-full text-center">
              <div className="text-sm">
                <Link
                  className="font-medium text-muted-foreground hover:text-foreground"
                  href="/login"
                >
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
