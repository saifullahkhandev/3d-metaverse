"use client";
import { Check } from "lucide-react";
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
import { acceptInvitationAction } from "@/data/user/invitation";
import { useRouter } from "@/i18n/navigation";

export const ConfirmAcceptInvitationDialog = ({
  invitationId,
}: {
  invitationId: string;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: acceptInvitation, isPending: isAccepting } = useAction(
    acceptInvitationAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading("Accepting invitation...");
      },
      onSuccess: ({ data }) => {
        if (data) {
          toast.success("Invitation accepted!", {
            id: toastRef.current,
          });
          toastRef.current = undefined;
          // Navigate first, then close the dialog
          router.push(data);
          setOpen(false);
        }
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? "Failed to accept invitation";
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setOpen(false);
      },
    }
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          data-testid="dialog-accept-invitation-trigger"
          size="default"
          variant="default"
        >
          <Check className="mr-2 h-5 w-5" /> Accept Invitation
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="dialog-accept-invitation-content"
      >
        <DialogHeader>
          <div className="w-fit rounded-lg bg-gray-200/50 p-3 dark:bg-gray-700/40">
            <Check className="h-6 w-6" />
          </div>
          <div className="p-1">
            <DialogTitle className="text-lg">Accept Invitation</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to accept this invitation?
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            data-testid="cancel"
            disabled={isAccepting}
            onClick={() => {
              setOpen(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            data-testid="confirm"
            disabled={isAccepting}
            onClick={() => {
              acceptInvitation({ invitationId });
              // Dialog will close in onSuccess or onError callback
            }}
            type="button"
            variant="default"
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
