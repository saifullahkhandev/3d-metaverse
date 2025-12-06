import { cache } from "react";
import { getAnonUserFeedbackList } from "@/data/anon/marketing-feedback";
import { commonPublicCache, superAdminCache } from "@/typed-cache-tags";
import { FeedbackList } from "./feedback-list";
import type { FiltersSchema } from "./schema";

interface AnonFeedbackListProps {
  filters: FiltersSchema;
}

const cachedGetAnonUserFeedbackList = cache(getAnonUserFeedbackList);

export async function AnonFeedbackList({ filters }: AnonFeedbackListProps) {
  "use cache: remote";
  commonPublicCache.components.feedback.list.cacheTag();
  const { data: feedbacks, count: totalFeedbackPages } =
    await cachedGetAnonUserFeedbackList(filters);

  return (
    <FeedbackList
      feedbacks={feedbacks}
      filters={filters}
      totalPages={totalFeedbackPages}
      userType="anon"
    />
  );
}
