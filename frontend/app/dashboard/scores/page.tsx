'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, TrendingUp, Award, Target } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useAuthStore } from '@/lib/store/auth';

interface Score {
  score: number;
  exam_type: string;
  notes?: string;
  date: string;
}

interface ModuleScores {
  [moduleId: string]: Score[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScoresPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [scores, setScores] = useState<ModuleScores>({});
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [newScore, setNewScore] = useState({ score: '', exam_type: 'midterm', notes: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchScores();
      fetchStats();
    }
  }, [isAuthenticated, user]);

  const fetchScores = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/student/scores`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      setScores(data.scores || {});
      setAverages(data.averages || {});
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/student/stats`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !newScore.score) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/student/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          module_id: selectedModule,
          score: parseFloat(newScore.score),
          exam_type: newScore.exam_type,
          notes: newScore.notes || undefined,
        }),
      });

      if (response.ok) {
        await fetchScores();
        await fetchStats();
        setShowAddForm(false);
        setNewScore({ score: '', exam_type: 'midterm', notes: '' });
        setSelectedModule('');
      }
    } catch (error) {
      console.error('Error adding score:', error);
      alert('فشل إضافة الدرجة');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout title="الدرجات">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#4b58ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">جاري التحميل...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="الدرجات والتقييمات">
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-glass p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#4b58ff]/10 flex items-center justify-center">
                  <BookOpen className="text-[#4b58ff]" size={24} />
                </div>
                <div>
                  <p className="text-muted text-sm">إجمالي المواد</p>
                  <p className="text-2xl font-bold text-white">{stats?.total_modules || 0}</p>
                </div>
              </div>
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-muted text-sm">المعدل العام</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.average_score != null ? stats.average_score.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Target className="text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="text-muted text-sm">قيد التقدم</p>
                  <p className="text-2xl font-bold text-white">{stats?.modules_in_progress || 0}</p>
                </div>
              </div>
            </div>

            <div className="card-glass p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Award className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-muted text-sm">مكتملة</p>
                  <p className="text-2xl font-bold text-white">{stats?.modules_completed || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Score Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة درجة جديدة
          </button>
        </div>

        {/* Add Score Form */}
        {showAddForm && (
          <div className="card-glass p-6">
            <h3 className="text-lg font-bold text-white mb-4">إضافة درجة جديدة</h3>
            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">المادة</label>
                <input
                  type="text"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  placeholder="أدخل معرف المادة"
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">الدرجة (من 20)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    value={newScore.score}
                    onChange={(e) => setNewScore({ ...newScore, score: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">نوع الامتحان</label>
                  <select
                    value={newScore.exam_type}
                    onChange={(e) => setNewScore({ ...newScore, exam_type: e.target.value })}
                    className="input w-full"
                  >
                    <option value="midterm">امتحان جزئي</option>
                    <option value="final">امتحان نهائي</option>
                    <option value="td">TD</option>
                    <option value="project">مشروع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={newScore.notes}
                  onChange={(e) => setNewScore({ ...newScore, notes: e.target.value })}
                  className="input w-full min-h-[100px]"
                  placeholder="أضف ملاحظات..."
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scores List */}
        <div className="space-y-4">
          {Object.keys(scores).length === 0 ? (
            <div className="card-glass p-12 text-center">
              <BookOpen className="text-muted mx-auto mb-4" size={48} />
              <p className="text-muted text-lg">لا توجد درجات مسجلة بعد</p>
              <p className="text-muted text-sm mt-2">ابدأ بإضافة درجاتك الأولى</p>
            </div>
          ) : (
            Object.entries(scores).map(([moduleId, moduleScores]) => (
              <div key={moduleId} className="card-glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{moduleId}</h3>
                  {averages[moduleId] != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-sm">المعدل:</span>
                      <span className="text-2xl font-bold text-[#4b58ff]">
                        {typeof averages[moduleId] === 'number' ? averages[moduleId].toFixed(2) : '0.00'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {moduleScores.map((score, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-white">{score.score}</span>
                          <span className="text-muted">/ 20</span>
                          <span className="px-3 py-1 rounded-lg bg-[#4b58ff]/10 text-[#4b58ff] text-sm font-semibold">
                            {score.exam_type === 'midterm' ? 'جزئي' :
                             score.exam_type === 'final' ? 'نهائي' :
                             score.exam_type === 'td' ? 'TD' : 'مشروع'}
                          </span>
                        </div>
                        {score.notes && (
                          <p className="text-muted text-sm mt-2">{score.notes}</p>
                        )}
                        <p className="text-muted text-xs mt-1">
                          {new Date(score.date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

