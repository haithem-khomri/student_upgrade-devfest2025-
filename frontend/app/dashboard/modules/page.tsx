'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  ClipboardList,
  GraduationCap,
  Clock,
  Star,
  ChevronLeft,
  Loader2,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import DashboardLayout from '@/app/components/DashboardLayout';

interface Module {
  id: string;
  name: string;
  code: string;
  year: string;
  semester: number;
  credits: number;
  courses_count: number;
  tds_count: number;
  exams_count: number;
  progress: {
    courses_completed: number;
    tds_completed: number;
    grade: number | null;
  };
}

interface StudentData {
  student: {
    name: string;
    email: string;
    level: string;
    semester: number;
  };
  speciality: {
    id: string;
    name: string;
    code: string;
  };
  enrolled_modules: Module[];
  total_modules: number;
}

export default function ModulesPage() {
  const { user } = useAuthStore();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterSemester, setFilterSemester] = useState<number | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/chat/student/${user.email}`);
        const data = await response.json();
        setStudentData(data);
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const getProgressPercentage = (module: Module) => {
    const totalItems = module.courses_count + module.tds_count;
    if (totalItems === 0) return 0;
    const completedItems = (module.progress?.courses_completed || 0) + (module.progress?.tds_completed || 0);
    return Math.round((completedItems / totalItems) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredModules = studentData?.enrolled_modules?.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = filterSemester === null || module.semester === filterSemester;
    return matchesSearch && matchesSemester;
  }) || [];

  const semesters = [...new Set(studentData?.enrolled_modules?.map(m => m.semester) || [])].sort();

  return (
    <DashboardLayout 
      title="المواد الدراسية"
      subtitle={`${studentData?.total_modules || 0} مادة مسجلة`}
    >
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="البحث في المواد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-muted" size={18} />
          <select
            value={filterSemester || ''}
            onChange={(e) => setFilterSemester(e.target.value ? Number(e.target.value) : null)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4b58ff]"
          >
            <option value="">كل الفصول</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>الفصل {sem}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#4b58ff] text-white' : 'text-muted hover:text-white'}`}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#4b58ff] text-white' : 'text-muted hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Modules */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#4b58ff]" size={40} />
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <BookOpen className="mx-auto mb-4 text-muted" size={48} />
          <p className="text-white font-semibold mb-2">لم يتم العثور على مواد</p>
          <p className="text-muted">جرب تغيير معايير البحث أو الفلتر</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => {
            const progress = getProgressPercentage(module);
            return (
              <Link
                key={module.id}
                href={`/dashboard/module/${module.id}`}
                className="card-glow group cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#4b58ff] flex items-center justify-center text-white font-bold text-lg">
                      {module.code.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs text-[#4b58ff] font-semibold">{module.code}</span>
                      <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors line-clamp-1">
                        {module.name}
                      </h4>
                    </div>
                  </div>
                  <ChevronLeft className="text-muted group-hover:text-[#4b58ff] group-hover:-translate-x-1 transition-all" size={20} />
                </div>

                {/* Module Info */}
                <div className="flex items-center gap-4 text-sm text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    S{module.semester}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} />
                    {module.credits} رصيد
                  </span>
                </div>

                {/* Content Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <FileText className="mx-auto mb-1 text-green-400" size={18} />
                    <span className="text-white font-semibold">{module.courses_count}</span>
                    <p className="text-xs text-muted">دروس</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <ClipboardList className="mx-auto mb-1 text-orange-400" size={18} />
                    <span className="text-white font-semibold">{module.tds_count}</span>
                    <p className="text-xs text-muted">TD</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <GraduationCap className="mx-auto mb-1 text-red-400" size={18} />
                    <span className="text-white font-semibold">{module.exams_count}</span>
                    <p className="text-xs text-muted">امتحان</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted">التقدم</span>
                    <span className="text-white font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredModules.map((module) => {
            const progress = getProgressPercentage(module);
            return (
              <Link
                key={module.id}
                href={`/dashboard/module/${module.id}`}
                className="card-glass p-4 flex items-center gap-4 group hover:border-[#4b58ff]/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4b58ff] flex items-center justify-center text-white font-bold shrink-0">
                  {module.code.slice(0, 2)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#4b58ff] font-semibold">{module.code}</span>
                    <span className="text-xs text-muted">• S{module.semester}</span>
                  </div>
                  <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors truncate">
                    {module.name}
                  </h4>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <FileText size={14} className="text-green-400" />
                    {module.courses_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList size={14} className="text-orange-400" />
                    {module.tds_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap size={14} className="text-red-400" />
                    {module.exams_count}
                  </span>
                </div>

                <div className="w-24 hidden md:block">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted">التقدم</span>
                    <span className="text-white font-semibold">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ChevronLeft className="text-muted group-hover:text-[#4b58ff] shrink-0" size={20} />
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

