"use client";

import { BookOpen } from "lucide-react";
import ResourceCard from "./ResourceCard";
import type { Resource } from "../utils/api";

interface ResourcesSectionProps {
  resources: Resource[];
  userRatings: Record<string, number>;
  ratingLoading: string | null;
  onRateResource: (resourceId: string, rating: number) => void;
}

export default function ResourcesSection({
  resources,
  userRatings,
  ratingLoading,
  onRateResource,
}: ResourcesSectionProps) {
  if (resources.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
        <BookOpen className="text-[#4b58ff]" size={24} />
        موارد تعليمية ({resources.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            userRating={userRatings[resource.id]}
            ratingLoading={ratingLoading === resource.id}
            onRate={(rating) => onRateResource(resource.id, rating)}
          />
        ))}
      </div>
    </div>
  );
}

