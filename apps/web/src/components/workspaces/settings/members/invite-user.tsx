"use client";

import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { toast } from "sonner";
import { createInvitationAction } from "@/data/user/invitation";
import { useRouter } from "@/i18n/navigation";
import type { Enum, WorkspaceWithMembershipType } from "@/types";
import { InviteWorkspaceMemberDialog } from "./invite-workspace-member-dialog";

export function InviteUser({
  workspace,
}: {
  workspace: WorkspaceWithMembershipType;
}) {
  const toastRef = useRef<string | number | undefined>(undefined);
  const router = useRouter();
  const onCloseRef = useRef<(() => void) | null>(null);

  const { execute, status } = useAction(createInvitationAction, {
    onExecute: () => {
      toastRef.current = toast.loading("Inviting user...");
    },
    onSuccess: () => {
      toast.success("User invited!", { id: toastRef.current });
      toastRef.current = undefined;
      // Close the dialog after successful invitation
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError || "Failed to invite user";
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
      // Close the dialog even on error
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    },
  });

  const handleInvite = (
    email: string,
    role: Exclude<Enum<"workspace_member_role_type">, "owner">
  ) => {
    execute({
      email,
      workspaceId: workspace.id,
      role,
    });
  };

  return (
    <InviteWorkspaceMemberDialog
      isLoading={status === "executing"}
      onCloseRef={onCloseRef}
      onInvite={handleInvite}
    />
  );
}
