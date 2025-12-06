import { formatDistance } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { anonGetUserProfile } from "@/data/user/elevated-queries";
import type { DBTable } from "@/types";

export async function FeedbackAvatarServer({
  feedback,
}: {
  feedback: DBTable<"marketing_feedback_threads">;
}) {
  const publicUserName = await anonGetUserProfile(feedback.user_id);
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-7 w-7">
        <AvatarImage
          alt="User avatar"
          src={publicUserName?.avatarUrl ?? undefined}
        />
        <AvatarFallback className="bg-muted font-medium text-muted-foreground text-xs">
          {publicUserName?.fullName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          {publicUserName?.fullName ?? "New User"}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {formatDistance(new Date(feedback.created_at), new Date(), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>
  );
}
