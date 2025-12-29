"use client";

import { Star, FileText, Play } from "lucide-react";
import type { Resource } from "../utils/api";

interface ResourceCardProps {
  resource: Resource;
  userRating?: number;
  ratingLoading: boolean;
  onRate: (rating: number) => void;
}

export default function ResourceCard({
  resource,
  userRating,
  ratingLoading,
  onRate,
}: ResourceCardProps) {
  const displayRating = userRating ?? resource.average_rating;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-glass overflow-hidden group hover:border-[#4b58ff]/30 transition-all"
    >
      {resource.type === "video" && resource.thumbnail && (
        <div className="relative h-36 bg-black/50 overflow-hidden">
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
              <Play className="text-white ml-1" size={24} />
            </div>
          </div>
          {resource.duration && (
            <span className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {resource.duration}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {resource.type !== "video" && (
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                resource.type === "pdf"
                  ? "bg-blue-500/20"
                  : resource.type === "notebook"
                  ? "bg-orange-500/20"
                  : "bg-gray-500/20"
              }`}
            >
              <FileText
                className={`${
                  resource.type === "pdf"
                    ? "text-blue-400"
                    : resource.type === "notebook"
                    ? "text-orange-400"
                    : "text-gray-400"
                }`}
                size={20}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium group-hover:text-[#4b58ff] transition-colors line-clamp-2">
              {resource.title}
            </h4>
            {resource.channel && (
              <p className="text-xs text-muted mt-1">{resource.channel}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted line-clamp-2 mb-3">
          {resource.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRate(star);
                }}
                disabled={ratingLoading}
                className={`transition-all hover:scale-110 ${
                  ratingLoading ? "opacity-50" : ""
                }`}
              >
                <Star
                  size={16}
                  className={`${
                    star <= displayRating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-500"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm text-muted">
            {resource.average_rating.toFixed(1)} ({resource.rating_count})
          </span>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-white/5 text-muted px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

