"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: number | null;
  moduleDifficulty: number;
  onSave: (difficulty: number) => Promise<void>;
  isSaving: boolean;
}

export default function DifficultyModal({
  isOpen,
  onClose,
  currentDifficulty,
  moduleDifficulty,
  onSave,
  isSaving,
}: DifficultyModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(
    null
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDifficulty(currentDifficulty ?? moduleDifficulty ?? null);
      setSaveSuccess(false);
    }
  }, [isOpen, currentDifficulty, moduleDifficulty]);

  const handleSave = async () => {
    const diff =
      selectedDifficulty ?? currentDifficulty ?? moduleDifficulty ?? 5;
    await onSave(diff);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
      setSaveSuccess(false);
      setSelectedDifficulty(null);
    }, 1500);
  };

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 3) return "سهل";
    if (diff <= 6) return "متوسط";
    return "صعب";
  };

  if (!isOpen) return null;

  const currentDiff =
    selectedDifficulty ?? currentDifficulty ?? moduleDifficulty ?? 5;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">تعديل مستوى الصعوبة</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        {saveSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#4b58ff]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-[#4b58ff]" size={32} />
            </div>
            <p className="text-white font-semibold text-lg mb-2">
              تم الحفظ بنجاح!
            </p>
            <p className="text-muted text-sm">تم تحديث مستوى الصعوبة</p>
          </div>
        ) : (
          <>
            <p className="text-muted mb-6 text-center">
              قيّم مستوى صعوبة هذه المادة من 1 (سهل جداً) إلى 10 (صعب جداً)
            </p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted font-medium">سهل جداً</span>
                <span className="text-sm text-muted font-medium">صعب جداً</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                  const isSelected = currentDiff >= level;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedDifficulty(level)}
                      disabled={isSaving}
                      className={`flex-1 h-12 rounded-lg font-bold transition-all duration-200 ${
                        isSelected
                          ? "bg-[#4b58ff] text-white hover:bg-[#6366f1] shadow-lg shadow-[#4b58ff]/30"
                          : "bg-white/5 text-muted hover:bg-white/10 border border-white/5"
                      } ${
                        isSaving
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white font-bold text-xl">
                    {currentDiff}/10
                  </span>
                  <span className="text-muted text-sm">|</span>
                  <span className="text-muted text-sm">
                    {getDifficultyLabel(currentDiff)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-ghost flex-1"
                disabled={isSaving}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>حفظ</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

