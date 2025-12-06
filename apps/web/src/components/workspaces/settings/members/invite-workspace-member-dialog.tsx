"use client";
import { UserPlus } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceMemberRoleSelect } from "@/components/workspace-member-role-select";
import type { Enum } from "@/types";

type Props = {
  onInvite: (
    email: string,
    role: Exclude<Enum<"workspace_member_role_type">, "owner">
  ) => void;
  isLoading: boolean;
  onCloseRef: React.MutableRefObject<(() => void) | null>;
};

export const InviteWorkspaceMemberDialog = ({
  onInvite,
  isLoading,
  onCloseRef,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<Exclude<Enum<"workspace_member_role_type">, "owner">>("member");

  // Set the close function reference
  onCloseRef.current = () => {
    setOpen(false);
    setEmail("");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          data-testid="invite-user-button"
          size="default"
          variant="default"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Invite user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 w-fit rounded-lg bg-gray-200/50 p-3 dark:bg-gray-700/40">
            <UserPlus className="h-6 w-6" />
          </div>
          <div className="p-1">
            <DialogTitle className="text-lg">Invite user</DialogTitle>
            <DialogDescription className="mt-0 text-base">
              Invite a user to your workspace.
            </DialogDescription>
          </div>
        </DialogHeader>
        <form
          data-testid="invite-user-form"
          onSubmit={(event) => {
            event.preventDefault();
            onInvite(email, role);
            // Don't close dialog here - wait for server action to complete
            // Dialog will be closed by onSuccess/onError callbacks
          }}
        >
          <div className="mb-8">
            <div className="mb-4 flex w-full flex-col justify-start space-y-2">
              <Label className="text-muted-foreground">Select a role</Label>
              <WorkspaceMemberRoleSelect
                onChange={(newRole) => setRole(newRole)}
                value={role}
              />
            </div>
            <Label className="text-muted-foreground">Enter Email</Label>
            <Input
              className="mt-1.5 h-11 w-full appearance-none rounded-lg border px-3 py-2 text-base leading-tight shadow-sm focus:shadow-outline focus:outline-hidden focus:ring-0"
              disabled={isLoading}
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit" variant="default">
              {isLoading ? "Inviting User" : "Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
