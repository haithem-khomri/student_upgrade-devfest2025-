'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'حفظ',
  isLoading = false
}: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {onSubmit && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#4b58ff] hover:bg-[#4b58ff]/80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

