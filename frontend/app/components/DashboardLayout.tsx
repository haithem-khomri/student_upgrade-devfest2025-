'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/lib/store/auth';
import { Loader2, Bell, Search, Menu, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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
  } | null;
  enrolled_modules: Array<{
    id: string;
    name: string;
    code: string;
    year: string;
    semester: number;
    credits: number;
    courses_count: number;
    tds_count: number;
    exams_count: number;
  }>;
  total_modules: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle,
  showSearch = false 
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchStudentData = async () => {
      if (!user?.email) {
        setLoading(false);
        setError('البريد الإلكتروني غير متوفر');
        return;
      }

      try {
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/api/chat/student/${user.email}`);
        setStudentData(response.data);
      } catch (error: any) {
        console.error('Error fetching student data:', error);
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Failed to fetch')) {
          setError('لا يمكن الاتصال بالخادم. تأكد من أن الخادم الخلفي يعمل على المنفذ 8001');
        } else {
          setError('حدث خطأ في تحميل البيانات');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-muted mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  const fetchStudentData = async () => {
                    if (!user?.email) return;
                    try {
                      const response = await axios.get(`${API_BASE_URL}/api/chat/student/${user.email}`);
                      setStudentData(response.data);
                      setError(null);
                    } catch (err: any) {
                      console.error('Error fetching student data:', err);
                      if (err.code === 'ERR_NETWORK' || err.message?.includes('Failed to fetch')) {
                        setError('لا يمكن الاتصال بالخادم. تأكد من أن الخادم الخلفي يعمل على المنفذ 8001');
                      } else {
                        setError('حدث خطأ في تحميل البيانات');
                      }
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchStudentData();
                }}
                className="w-full px-4 py-2 bg-[#4b58ff] hover:bg-[#3d47cc] text-white rounded-lg transition-colors"
              >
                إعادة المحاولة
              </button>
              <p className="text-sm text-muted mt-4">
                جرب تسجيل الدخول بـ: <span className="text-white font-mono">demo@student.ai</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar studentData={studentData && studentData.student ? {
        student: {
          name: studentData.student.name,
          level: studentData.student.level,
          semester: studentData.student.semester,
        },
        speciality: studentData.speciality ? {
          name: studentData.speciality.name,
          code: studentData.speciality.code,
        } : undefined,
      } : null} />

      {/* Main Content */}
      <main className="lg:pr-72 pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-white/5">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Title Section */}
              <div className="min-w-0">
                {title && (
                  <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted mt-0.5 truncate">{subtitle}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Search */}
                {showSearch && (
                  <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                    <Search className="text-muted" size={18} />
                    <input
                      type="text"
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none w-40 lg:w-64 placeholder:text-muted"
                    />
                  </div>
                )}

                {/* Notifications */}
                <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Bell className="text-muted" size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#4b58ff] rounded-full" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

