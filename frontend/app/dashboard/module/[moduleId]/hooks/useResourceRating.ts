import { useState, useCallback } from "react";
import { rateResource } from "../utils/api";

interface UseResourceRatingProps {
  userId?: string;
  moduleId: string;
}

export function useResourceRating({ userId, moduleId }: UseResourceRatingProps) {
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  const handleRateResource = useCallback(
    async (resourceId: string, rating: number) => {
      if (!userId) return;

      setRatingLoading(resourceId);
      try {
        await rateResource(userId, resourceId, rating, moduleId);
        setUserRatings((prev) => ({ ...prev, [resourceId]: rating }));
      } catch (error) {
        console.error("Error rating resource:", error);
      } finally {
        setRatingLoading(null);
      }
    },
    [userId, moduleId]
  );

  return {
    userRatings,
    ratingLoading,
    handleRateResource,
  };
}

