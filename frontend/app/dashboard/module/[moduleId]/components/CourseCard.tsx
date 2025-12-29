"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, Play, Lightbulb } from "lucide-react";
import type { Course } from "../utils/api";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card-glass overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-right"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 font-bold">{course.chapter}</span>
          </div>
          <div>
            <h4 className="text-white font-semibold">{course.title}</h4>
            <p className="text-sm text-muted flex items-center gap-2">
              <Clock size={14} />
              {course.duration_hours} ساعات
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-muted" size={20} />
        ) : (
          <ChevronDown className="text-muted" size={20} />
        )}
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <p className="text-muted leading-relaxed">{course.content}</p>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2">
              <Play size={16} />
              بدء الدرس
            </button>
            <button className="btn btn-ghost px-4 py-2 text-sm flex items-center gap-2">
              <Lightbulb size={16} />
              إنشاء ملخص
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

