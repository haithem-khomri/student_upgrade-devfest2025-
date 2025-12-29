'use client';

import { useState } from 'react';
import { Target, Plus, Search, ChevronLeft, Trophy, Clock } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import Link from 'next/link';

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock quizzes
  const quizzes = [
    { id: '1', title: 'اختبار الخوارزميات', questions: 10, module: 'ALGO1', bestScore: 8, attempts: 3 },
    { id: '2', title: 'اختبار البرمجة C', questions: 15, module: 'PROG1', bestScore: 12, attempts: 2 },
    { id: '3', title: 'اختبار SQL', questions: 12, module: 'BDD', bestScore: null, attempts: 0 },
  ];

  return (
    <DashboardLayout 
      title="الاختبارات"
      subtitle="اختبر معرفتك وتتبع تقدمك"
    >
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="البحث في الاختبارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          اختبار جديد
        </button>
      </div>

      {/* Quizzes */}
      {quizzes.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <Target className="mx-auto mb-4 text-muted" size={48} />
          <h3 className="text-white font-semibold text-lg mb-2">لا توجد اختبارات بعد</h3>
          <p className="text-muted mb-4">أنشئ اختبارات من دروسك لتقييم فهمك</p>
          <button className="btn btn-primary">
            <Plus size={18} />
            إنشاء اختبار
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className="card-glass p-5 group hover:border-[#4b58ff]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Target className="text-green-400" size={24} />
                </div>
                <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded">{quiz.module}</span>
              </div>
              <h4 className="text-white font-bold mb-2 group-hover:text-[#4b58ff] transition-colors">
                {quiz.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-muted mb-4">
                <span>{quiz.questions} سؤال</span>
                <span>{quiz.attempts} محاولات</span>
              </div>
              
              {quiz.bestScore !== null && (
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="text-yellow-400" size={16} />
                  <span className="text-white font-semibold">{quiz.bestScore}/{quiz.questions}</span>
                  <span className="text-muted text-sm">أفضل نتيجة</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/5">
                <button className="w-full btn btn-primary flex items-center justify-center gap-2">
                  <Clock size={16} />
                  {quiz.attempts > 0 ? 'إعادة الاختبار' : 'ابدأ الاختبار'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

