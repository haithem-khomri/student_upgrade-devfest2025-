"use client";

import { useState } from "react";
import { X, CheckCircle, Target } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
}

export default function QuizModal({
  isOpen,
  onClose,
  questions,
}: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  const getScoreMessage = () => {
    if (score === questions.length) return "ممتاز! أداء رائع 🌟";
    if (score >= questions.length / 2) return "جيد! استمر في التحسن 💪";
    return "حاول مرة أخرى 📚";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">اختبار سريع</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {finished ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-[#4b58ff]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-[#4b58ff]" size={40} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">انتهى الاختبار!</h4>
            <p className="text-3xl font-bold text-[#4b58ff] mb-4">
              {score} / {questions.length}
            </p>
            <p className="text-muted mb-6">{getScoreMessage()}</p>
            <button
              onClick={handleRestart}
              className="btn btn-primary flex items-center justify-center gap-2 mx-auto"
            >
              <Target size={18} />
              إعادة الاختبار
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted mb-2">
                <span>
                  السؤال {currentIndex + 1} من {questions.length}
                </span>
                <span>النتيجة: {score}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4b58ff] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="text-white text-lg mb-6">{currentQuestion.question}</p>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() =>
                    selectedAnswer === null && handleAnswer(index)
                  }
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl text-right transition-all ${
                    selectedAnswer === null
                      ? "bg-white/5 hover:bg-white/10 text-white"
                      : index === currentQuestion.correctIndex
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : selectedAnswer === index
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

