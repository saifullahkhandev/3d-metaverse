"use client";
import { Settings } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface RedirectingPleaseWaitCardProps {
  message: string;
  heading: string;
}

export function RedirectingPleaseWaitCard({
  message,
  heading,
}: RedirectingPleaseWaitCardProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4">
      <Card className="w-full min-w-[320px] overflow-hidden border p-1 shadow-md">
        <CardHeader className="space-y-4 pt-8 pb-6">
          <div className="mx-auto w-fit rounded-full bg-muted/30 p-3">
            <Settings className="h-8 w-8" />
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
      </Card>
    </div>
  );
}
