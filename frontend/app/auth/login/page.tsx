'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4b58ff]/10 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#4b58ff]/8 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/5 rounded-full blur-[200px] animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
      
      {/* Animated Grid Lines */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(75, 88, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(75, 88, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'shimmer 15s linear infinite'
        }} />
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-slideUp">
        <div className="card-glass p-10 lg:p-12">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8 animate-slideDown">
            <div className="relative group">
              <Image 
                src="/icon.png" 
                alt="Student AI Logo" 
                width={120} 
                height={120}
                className="object-contain w-28 h-28 brightness-110 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                priority
              />
            </div>
          </div>

          <div className="text-center mb-10 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl font-bold text-white mb-3">مرحباً بعودتك</h1>
            <p className="text-muted font-light">سجل الدخول للمتابعة</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ff4757] animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-white mb-3">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pr-12"
                  placeholder="student@university.edu"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-medium text-white mb-3">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pr-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-3 mt-8 py-4 animate-slideUp relative overflow-hidden group"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                  <span className="relative z-10">جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">تسجيل الدخول</span>
                  <ArrowLeft size={18} className="relative z-10 group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Sparkles size={16} className="text-[#4b58ff]" />
              <span className="font-semibold">حسابات تجريبية:</span>
            </div>
            
            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() => { setEmail('demo@student.ai'); setPassword('demo123'); }}
                className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-right text-sm transition-all border border-transparent hover:border-[#4b58ff]/30"
              >
                <span className="text-white font-medium">demo@student.ai</span>
                <span className="text-muted mr-2">- L2 قواعد البيانات</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('student1_l1@univ-alger.dz'); setPassword('student123'); }}
                className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-right text-sm transition-all border border-transparent hover:border-[#4b58ff]/30"
              >
                <span className="text-white font-medium">student1_l1@univ-alger.dz</span>
                <span className="text-muted mr-2">- L1 خوارزميات</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('student2_m1@univ-alger.dz'); setPassword('student123'); }}
                className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-right text-sm transition-all border border-transparent hover:border-[#4b58ff]/30"
              >
                <span className="text-white font-medium">student2_m1@univ-alger.dz</span>
                <span className="text-muted mr-2">- M1 تعلم الآلة</span>
              </button>
            </div>
            
            <Link 
              href="/" 
              className="block text-center text-[#4b58ff] hover:text-[#6b75ff] transition-colors text-sm font-medium"
            >
              ← العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
