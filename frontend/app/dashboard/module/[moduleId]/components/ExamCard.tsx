"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, GraduationCap, Target } from "lucide-react";
import type { Exam } from "../utils/api";

interface ExamCardProps {
  exam: Exam;
}

export default function ExamCard({ exam }: ExamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card-glass overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-right"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              exam.type === "final" ? "bg-red-500/20" : "bg-yellow-500/20"
            }`}
          >
            <GraduationCap
              className={exam.type === "final" ? "text-red-400" : "text-yellow-400"}
              size={20}
            />
          </div>
          <div>
            <h4 className="text-white font-semibold">{exam.title}</h4>
            <p className="text-sm text-muted flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {exam.duration_minutes} دقيقة
              </span>
              <span>{exam.total_points} نقطة</span>
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
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
          <p className="text-sm text-muted mb-3">
            الأسئلة ({exam.questions.length}):
          </p>
          {exam.questions.map((question, index) => (
            <div key={question.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm text-muted font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white">{question.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted">
                    <span>{question.points} نقاط</span>
                    <span className="px-2 py-0.5 rounded bg-white/10">
                      {question.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2">
            <Target size={18} />
            التدرب على هذا الامتحان
          </button>
        </div>
      )}
    </div>
  );
}

