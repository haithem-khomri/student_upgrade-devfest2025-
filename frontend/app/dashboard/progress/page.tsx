'use client';

import { TrendingUp, Target, Award, Calendar, Clock, BookOpen } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function ProgressPage() {
  // Mock progress data
  const stats = {
    totalModules: 5,
    completedModules: 2,
    totalCourses: 24,
    completedCourses: 8,
    totalHours: 45,
    studyStreak: 7
  };

  const weeklyProgress = [
    { day: 'السبت', hours: 2 },
    { day: 'الأحد', hours: 3 },
    { day: 'الاثنين', hours: 1.5 },
    { day: 'الثلاثاء', hours: 2.5 },
    { day: 'الأربعاء', hours: 4 },
    { day: 'الخميس', hours: 2 },
    { day: 'الجمعة', hours: 1 },
  ];

  const maxHours = Math.max(...weeklyProgress.map(d => d.hours));

  return (
    <DashboardLayout 
      title="تقدمي"
      subtitle="تتبع تقدمك الدراسي"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-glass p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#4b58ff]/20 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="text-[#4b58ff]" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.completedModules}/{stats.totalModules}</div>
          <div className="text-sm text-muted">المواد المكتملة</div>
        </div>
        <div className="card-glass p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <Target className="text-green-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.completedCourses}/{stats.totalCourses}</div>
          <div className="text-sm text-muted">الدروس المكتملة</div>
        </div>
        <div className="card-glass p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
            <Clock className="text-orange-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalHours}h</div>
          <div className="text-sm text-muted">ساعات الدراسة</div>
        </div>
        <div className="card-glass p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
            <Award className="text-purple-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.studyStreak}</div>
          <div className="text-sm text-muted">أيام متتالية</div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="card-glass p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-[#4b58ff]" size={20} />
          التقدم الأسبوعي
        </h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {weeklyProgress.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-36">
                <div 
                  className="w-full max-w-[40px] bg-[#4b58ff] rounded-t-lg transition-all"
                  style={{ height: `${(day.hours / maxHours) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted">{day.day}</span>
              <span className="text-xs text-white font-medium">{day.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Award className="text-[#4b58ff]" size={20} />
          الإنجازات
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-3xl mb-2">🌟</div>
            <p className="text-white font-medium text-sm">أول درس</p>
            <p className="text-xs text-muted">تم إكمال أول درس</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-white font-medium text-sm">7 أيام</p>
            <p className="text-xs text-muted">دراسة متواصلة</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center opacity-50">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-white font-medium text-sm">ماستر</p>
            <p className="text-xs text-muted">إكمال مادة</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center opacity-50">
            <div className="text-3xl mb-2">💎</div>
            <p className="text-white font-medium text-sm">متفوق</p>
            <p className="text-xs text-muted">معدل 16+</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

