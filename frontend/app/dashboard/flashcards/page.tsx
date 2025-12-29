'use client';

import { useState } from 'react';
import { FileText, Plus, Search, ChevronLeft, Layers } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import Link from 'next/link';

export default function FlashcardsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock flashcard sets
  const flashcardSets = [
    { id: '1', title: 'الخوارزميات - الفصل 1', cards: 15, module: 'ALGO1', lastStudied: '2024-01-15' },
    { id: '2', title: 'البرمجة C - المتغيرات', cards: 10, module: 'PROG1', lastStudied: '2024-01-14' },
    { id: '3', title: 'قواعد البيانات - SQL', cards: 20, module: 'BDD', lastStudied: '2024-01-10' },
  ];

  return (
    <DashboardLayout 
      title="البطاقات التعليمية"
      subtitle="راجع ما تعلمته باستخدام البطاقات"
    >
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="البحث في البطاقات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          مجموعة جديدة
        </button>
      </div>

      {/* Flashcard Sets */}
      {flashcardSets.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <Layers className="mx-auto mb-4 text-muted" size={48} />
          <h3 className="text-white font-semibold text-lg mb-2">لا توجد بطاقات بعد</h3>
          <p className="text-muted mb-4">ابدأ بإنشاء مجموعة بطاقات جديدة أو أنشئها من دروسك</p>
          <button className="btn btn-primary">
            <Plus size={18} />
            إنشاء مجموعة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardSets.map((set) => (
            <Link 
              key={set.id} 
              href={`/dashboard/flashcards/${set.id}`}
              className="card-glass p-5 group hover:border-[#4b58ff]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FileText className="text-purple-400" size={24} />
                </div>
                <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded">{set.module}</span>
              </div>
              <h4 className="text-white font-bold mb-2 group-hover:text-[#4b58ff] transition-colors">
                {set.title}
              </h4>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{set.cards} بطاقة</span>
                <span>آخر دراسة: {new Date(set.lastStudied).toLocaleDateString('ar')}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm text-[#4b58ff]">ابدأ المراجعة</span>
                <ChevronLeft className="text-[#4b58ff]" size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

