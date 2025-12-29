"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getDifficultyColor, getDifficultyText } from "../utils/constants";
import type { TD } from "../utils/api";

interface TDCardProps {
  td: TD;
}

export default function TDCard({ td }: TDCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card-glass overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-right"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-400 font-bold">{td.number}</span>
          </div>
          <div>
            <h4 className="text-white font-semibold">{td.title}</h4>
            <p className="text-sm text-muted">{td.exercises.length} تمارين</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-muted" size={20} />
        ) : (
          <ChevronDown className="text-muted" size={20} />
        )}
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
          {td.exercises.map((exercise, index) => (
            <div key={exercise.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm text-muted font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{exercise.title}</h5>
                    <p className="text-sm text-muted mt-1">
                      {exercise.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(
                    exercise.difficulty
                  )}`}
                >
                  {getDifficultyText(exercise.difficulty)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

