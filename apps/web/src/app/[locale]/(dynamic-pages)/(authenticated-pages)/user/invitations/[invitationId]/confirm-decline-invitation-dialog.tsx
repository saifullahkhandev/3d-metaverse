"use client";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { declineInvitationAction } from "@/data/user/invitation";

export const ConfirmDeclineInvitationDialog = ({
  invitationId,
}: {
  invitationId: string;
}) => {
  const [open, setOpen] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);
  const locale = useLocale();
  const { execute: declineInvitation, isPending: isDeclining } = useAction(
    declineInvitationAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading("Declining invitation...");
      },
      onSuccess: () => {
        toast.success("Invitation declined!", {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setOpen(false);
      },
      onError: ({ error }) => {
        const errorMessage =
          error.serverError ?? "Failed to decline invitation";
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button data-testid="decline" size="default" variant="outline">
          <X className="mr-2 h-5 w-5" /> Decline Invitation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-fit rounded-lg bg-gray-200/50 p-3 dark:bg-gray-700/40">
            <X className="h-6 w-6" />
          </div>
          <div className="p-1">
            <DialogTitle className="text-lg">Decline Invitation</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to decline this invitation?
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            disabled={isDeclining}
            onClick={() => {
              setOpen(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isDeclining}
            onClick={() => {
              declineInvitation({ invitationId, locale });
              setOpen(false);
            }}
            type="button"
            variant="destructive"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
