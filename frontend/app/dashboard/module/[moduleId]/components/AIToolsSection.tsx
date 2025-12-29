"use client";

import { Loader2, Layers, Target, Zap } from "lucide-react";

interface AIToolsSectionProps {
  onGenerateFlashcards: () => void;
  onGenerateQuiz: () => void;
  generatingAI: boolean;
}

export default function AIToolsSection({
  onGenerateFlashcards,
  onGenerateQuiz,
  generatingAI,
}: AIToolsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <button
        onClick={onGenerateFlashcards}
        disabled={generatingAI}
        className="card-glow p-5 text-right group disabled:opacity-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {generatingAI ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <Layers className="text-white" size={24} />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors">
              إنشاء بطاقات تعليمية
            </h4>
            <p className="text-sm text-muted">
              الذكاء الاصطناعي ينشئ بطاقات من الدروس
            </p>
          </div>
          <Zap className="text-purple-400" size={20} />
        </div>
      </button>
      <button
        onClick={onGenerateQuiz}
        disabled={generatingAI}
        className="card-glow p-5 text-right group disabled:opacity-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            {generatingAI ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <Target className="text-white" size={24} />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors">
              إنشاء اختبار سريع
            </h4>
            <p className="text-sm text-muted">اختبر نفسك بأسئلة من المادة</p>
          </div>
          <Zap className="text-green-400" size={20} />
        </div>
      </button>
    </div>
  );
}

