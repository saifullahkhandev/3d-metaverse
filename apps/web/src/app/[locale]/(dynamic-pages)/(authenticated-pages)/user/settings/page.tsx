import { Suspense } from "react";
import { getUserProfile } from "@/data/user/user";
import { serverGetLoggedInUserVerified } from "@/utils/server/server-get-logged-in-user";
import { AccountSettings } from "./account-settings";

async function AccountSettingsContent() {
  const user = await serverGetLoggedInUserVerified();
  const userProfile = await getUserProfile(user.id);
  return <AccountSettings userEmail={user.email} userProfile={userProfile} />;
}

export default async function AccountSettingsPage() {
  return (
    <Suspense>
      <AccountSettingsContent />
    </Suspense>
  );
}
