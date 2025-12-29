'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  ClipboardList,
  Sparkles,
  GraduationCap,
  Clock,
  Star,
  ChevronLeft,
  Loader2,
  Brain,
  Layers,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import DashboardLayout from '@/app/components/DashboardLayout';
import MoodDetector from '@/app/components/MoodDetector';
import MoodRecommendations from '@/app/components/MoodRecommendations';

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

interface MoodResult {
  emotion: string;
  mood: string;
  confidence: number;
  all_emotions: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoodDetector, setShowMoodDetector] = useState(true);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [hasDetectedMood, setHasDetectedMood] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Check if mood was already detected in this session
  useEffect(() => {
    const moodDetected = sessionStorage.getItem('mood_detected');
    if (moodDetected) {
      setShowMoodDetector(false);
      const storedMood = sessionStorage.getItem('mood_result');
      if (storedMood) {
        setMoodResult(JSON.parse(storedMood));
        setHasDetectedMood(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/chat/student/${user.email}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setStudentData(data);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchStudentData();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return null;
  }

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

  const handleMoodDetected = (mood: MoodResult) => {
    setMoodResult(mood);
    setHasDetectedMood(true);
    setShowMoodDetector(false);
    // Store in session to prevent re-detection
    sessionStorage.setItem('mood_detected', 'true');
    sessionStorage.setItem('mood_result', JSON.stringify(mood));
  };

  const handleDismissMoodDetector = () => {
    setShowMoodDetector(false);
    sessionStorage.setItem('mood_detected', 'skipped');
  };

  return (
    <DashboardLayout 
      title={`أهلاً، ${studentData?.student?.name || user?.name || 'طالب'} 👋`}
      subtitle={`${studentData?.speciality?.name || 'جاري التحميل...'} - الفصل ${studentData?.student?.semester || ''}`}
    >
      {/* Mood Detector Modal */}
      {showMoodDetector && !hasDetectedMood && (
        <MoodDetector
          onMoodDetected={handleMoodDetected}
          onClose={handleDismissMoodDetector}
          autoStart={true}
        />
      )}

      {/* Mood-Based Recommendations */}
      {moodResult && hasDetectedMood && (
        <MoodRecommendations
          mood={moodResult.mood}
          emotion={moodResult.emotion}
          confidence={moodResult.confidence}
          onDismiss={() => {
            setMoodResult(null);
            setHasDetectedMood(false);
            sessionStorage.removeItem('mood_result');
          }}
        />
      )}
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-glass p-5 text-center group hover:border-[#4b58ff]/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#4b58ff]/20 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="text-[#4b58ff]" size={24} />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{studentData?.total_modules || 0}</div>
          <div className="text-sm text-muted">المواد المسجلة</div>
        </div>
        <div className="card-glass p-5 text-center group hover:border-[#4b58ff]/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <FileText className="text-green-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {studentData?.enrolled_modules?.reduce((acc, m) => acc + m.courses_count, 0) || 0}
          </div>
          <div className="text-sm text-muted">الدروس</div>
        </div>
        <div className="card-glass p-5 text-center group hover:border-[#4b58ff]/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="text-orange-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {studentData?.enrolled_modules?.reduce((acc, m) => acc + m.tds_count, 0) || 0}
          </div>
          <div className="text-sm text-muted">الأعمال الموجهة</div>
        </div>
        <div className="card-glass p-5 text-center group hover:border-[#4b58ff]/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="text-red-500" size={24} />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {studentData?.enrolled_modules?.reduce((acc, m) => acc + m.exams_count, 0) || 0}
          </div>
          <div className="text-sm text-muted">الامتحانات</div>
        </div>
      </div>

      {/* AI Tools Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/features/chatbot" className="card-glass p-4 group hover:border-[#4b58ff]/30 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4b58ff] to-[#6366f1] flex items-center justify-center shrink-0">
            <Brain className="text-white" size={24} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors">المساعد الذكي</h4>
            <p className="text-muted text-sm truncate">اسأل أي سؤال</p>
          </div>
          <ChevronLeft className="text-muted group-hover:text-[#4b58ff] shrink-0" size={20} />
        </Link>
        
        <Link href="/features/content-generator" className="card-glass p-4 group hover:border-[#4b58ff]/30 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles className="text-white" size={24} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors">مولد المحتوى</h4>
            <p className="text-muted text-sm truncate">ملخصات وبطاقات</p>
          </div>
          <ChevronLeft className="text-muted group-hover:text-[#4b58ff] shrink-0" size={20} />
        </Link>

        <Link href="/features/study-decision" className="card-glass p-4 group hover:border-[#4b58ff]/30 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
            <Target className="text-white" size={24} />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-bold group-hover:text-[#4b58ff] transition-colors">قرارات الدراسة</h4>
            <p className="text-muted text-sm truncate">خطط ذكية للنجاح</p>
          </div>
          <ChevronLeft className="text-muted group-hover:text-[#4b58ff] shrink-0" size={20} />
        </Link>
      </div>

      {/* Modules Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Layers className="text-[#4b58ff]" size={24} />
            المواد الدراسية
          </h3>
          <Link href="/dashboard/modules" className="text-sm text-[#4b58ff] hover:underline flex items-center gap-1">
            عرض الكل
            <ChevronLeft size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#4b58ff]" size={40} />
          </div>
        ) : error ? (
          <div className="card-glass p-8 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-muted mt-2">جرب تسجيل الدخول بـ: demo@student.ai</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentData?.enrolled_modules?.slice(0, 6).map((module, index) => {
              const progress = getProgressPercentage(module);
              return (
                <Link
                  key={module.id}
                  href={`/dashboard/module/${module.id}`}
                  className="card-glow group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
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

                  {/* Grade if available */}
                  {module.progress?.grade && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-muted">المعدل</span>
                      <span className="text-[#4b58ff] font-bold text-lg">{module.progress.grade}/20</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-[#4b58ff]" size={24} />
            الأحداث القادمة
          </h3>
        </div>
        <div className="card-glass p-6">
          <div className="text-center py-8">
            <Calendar className="mx-auto mb-4 text-muted" size={48} />
            <p className="text-muted">لا توجد أحداث قادمة</p>
            <p className="text-sm text-muted/70 mt-1">سيتم عرض الامتحانات والمواعيد النهائية هنا</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
