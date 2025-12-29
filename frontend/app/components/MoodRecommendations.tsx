"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  BookOpen,
  Clock,
  Sparkles,
  Video,
  Coffee,
  Brain,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface MoodRecommendation {
  type: string;
  title: string;
  description: string;
  icon: string;
  priority: string;
}

interface StudySession {
  duration_minutes: number;
  break_interval: number;
  intensity: string;
  focus_areas: string[];
}

interface RecommendationsData {
  title: string;
  description: string;
  suggestions: MoodRecommendation[];
  recommended_modules?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  study_session: StudySession;
}

interface MoodRecommendationsProps {
  mood: string;
  emotion: string;
  confidence: number;
  onDismiss?: () => void;
}

export default function MoodRecommendations({
  mood,
  emotion,
  confidence,
  onDismiss,
}: MoodRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [mood]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/mood/recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mood,
            emotion,
            confidence,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      positive: "from-green-500 to-emerald-500",
      negative: "from-blue-500 to-cyan-500",
      calm: "from-purple-500 to-indigo-500",
      neutral: "from-gray-500 to-slate-500",
    };
    return colors[mood] || colors.neutral;
  };

  const getIconComponent = (icon: string) => {
    const iconMap: Record<string, any> = {
      "🎯": Target,
      "✨": Sparkles,
      "🚀": TrendingUp,
      "📚": BookOpen,
      "⏱️": Clock,
      "🎥": Video,
      "☕": Coffee,
      "🧠": Brain,
      "📖": FileText,
      "✍️": FileText,
      "⚖️": Target,
      "🎴": Sparkles,
      "📅": Calendar,
    };
    return iconMap[icon] || BookOpen;
  };

  if (loading) {
    return (
      <div className="card-glass p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b58ff]"></div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="card-glass p-6 mb-8 border-2 border-[#4b58ff]/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getMoodColor(mood)} mb-3`}>
            <span className="text-2xl">{getMoodEmoji(mood)}</span>
            <span className="text-white font-semibold">{recommendations.title}</span>
          </div>
          <p className="text-muted">{recommendations.description}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Study Session Info */}
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="text-[#4b58ff]" size={20} />
          <span className="text-white font-semibold">جلسة الدراسة المقترحة</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted">المدة</span>
            <p className="text-white font-bold">{recommendations.study_session.duration_minutes} دقيقة</p>
          </div>
          <div>
            <span className="text-muted">استراحة</span>
            <p className="text-white font-bold">كل {recommendations.study_session.break_interval} دقيقة</p>
          </div>
          <div>
            <span className="text-muted">الشدة</span>
            <p className="text-white font-bold">
              {recommendations.study_session.intensity === "high" ? "عالية" :
               recommendations.study_session.intensity === "low" ? "منخفضة" : "متوسطة"}
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="text-[#4b58ff]" size={18} />
          اقتراحات التعلم
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.suggestions.map((suggestion, index) => {
            const IconComponent = getIconComponent(suggestion.icon);
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  suggestion.priority === "high"
                    ? "bg-[#4b58ff]/10 border-[#4b58ff]/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    suggestion.priority === "high" ? "bg-[#4b58ff]/20" : "bg-white/10"
                  }`}>
                    <IconComponent className={suggestion.priority === "high" ? "text-[#4b58ff]" : "text-muted"} size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-white font-semibold mb-1">{suggestion.title}</h5>
                    <p className="text-sm text-muted">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Modules */}
      {recommendations.recommended_modules && recommendations.recommended_modules.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="text-[#4b58ff]" size={18} />
            مواد مقترحة
          </h4>
          <div className="space-y-2">
            {recommendations.recommended_modules.map((module) => (
              <Link
                key={module.id}
                href={`/dashboard/module/${module.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4b58ff]/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4b58ff]/20 flex items-center justify-center">
                    <BookOpen className="text-[#4b58ff]" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-[#4b58ff] transition-colors">
                      {module.name}
                    </p>
                    <p className="text-xs text-muted">{module.code}</p>
                  </div>
                </div>
                <ArrowRight className="text-muted group-hover:text-[#4b58ff] group-hover:translate-x-1 transition-all" size={18} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    positive: "😊",
    negative: "😔",
    calm: "😌",
    neutral: "😐",
  };
  return emojis[mood] || "😐";
}

