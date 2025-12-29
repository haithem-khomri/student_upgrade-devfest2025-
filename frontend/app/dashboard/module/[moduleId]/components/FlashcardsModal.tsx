"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
}

export default function FlashcardsModal({
  isOpen,
  onClose,
  flashcards,
}: FlashcardsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  if (!isOpen || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setShowBack(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
    setShowBack(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">البطاقات التعليمية</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div
          onClick={() => setShowBack(!showBack)}
          className="bg-gradient-to-br from-[#4b58ff]/20 to-purple-500/20 border border-white/10 rounded-xl p-8 min-h-[200px] flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
        >
          <p className="text-white text-center text-lg">
            {showBack ? currentCard.back : currentCard.front}
          </p>
        </div>
        <p className="text-center text-muted text-sm mt-3">اضغط للقلب</p>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn btn-primary px-4 py-2 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronRight size={18} />
            السابق
          </button>
          <span className="text-muted">
            {currentIndex + 1} / {flashcards.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="btn btn-primary px-4 py-2 disabled:opacity-50 flex items-center gap-2"
          >
            التالي
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

