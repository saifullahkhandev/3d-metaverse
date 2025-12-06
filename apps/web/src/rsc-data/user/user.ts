"use server";

import { cache } from "react";
import { getUserProfile } from "@/data/user/user";
import { serverGetLoggedInUserVerified } from "@/utils/server/server-get-logged-in-user";

export const getCachedUserProfile = cache(async () => {
  const user = await serverGetLoggedInUserVerified();
  return await getUserProfile(user.id);
});
