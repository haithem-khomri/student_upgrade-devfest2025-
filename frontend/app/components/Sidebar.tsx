'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Sparkles,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  GraduationCap,
  FileText,
  Target,
  Clock,
  Star,
  TrendingUp,
  HelpCircle,
  Bell,
  Award,
  Camera
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

interface SidebarProps {
  studentData?: {
    student: {
      name: string;
      level: string;
      semester: number;
    };
    speciality?: {
      name: string;
      code: string;
    } | null;
  } | null;
}

export default function Sidebar({ studentData }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuItems = [
    {
      title: 'الرئيسية',
      items: [
        { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
        { name: 'موادي', href: '/dashboard/modules', icon: BookOpen },
        { name: 'الدرجات', href: '/dashboard/scores', icon: Award },
        { name: 'تقدمي', href: '/dashboard/progress', icon: TrendingUp },
      ]
    },
    {
      title: 'أدوات الذكاء الاصطناعي',
      items: [
        { name: 'المساعد الذكي', href: '/features/chatbot', icon: MessageSquare },
        { name: 'مولد المحتوى', href: '/features/content-generator', icon: Sparkles },
        { name: 'قرارات الدراسة', href: '/features/study-decision', icon: Brain },
        { name: 'التعرف على الوجه', href: '/features/face-recognition', icon: Camera },
      ]
    },
    {
      title: 'الدراسة',
      items: [
        { name: 'البطاقات التعليمية', href: '/dashboard/flashcards', icon: FileText },
        { name: 'الاختبارات', href: '/dashboard/quizzes', icon: Target },
        { name: 'الجدول الزمني', href: '/dashboard/schedule', icon: Clock },
      ]
    },
    {
      title: 'الإدارة',
      items: [
        { name: 'إدارة المحتوى', href: '/dashboard/management', icon: Settings },
      ]
    },
    {
      title: 'أخرى',
      items: [
        { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
        { name: 'المساعدة', href: '/dashboard/help', icon: HelpCircle },
      ]
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col fixed top-0 right-0 h-screen z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#0a0a0a] border-l border-white/5" />
        
        {/* Content */}
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b border-white/5 ${isCollapsed ? 'px-2' : 'px-5'}`}>
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center justify-center group">
                <div className="relative">
                  <Image 
                    src="/icon.png" 
                    alt="Logo" 
                    width={isCollapsed ? 40 : 48} 
                    height={isCollapsed ? 40 : 48}
                    className={`object-contain brightness-110 drop-shadow-lg group-hover:scale-110 transition-all duration-300 filter group-hover:brightness-125 ${
                      isCollapsed ? 'w-10 h-10' : 'w-12 h-12'
                    }`}
                  />
                </div>
              </Link>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
              >
                {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className={`p-4 border-b border-white/5 ${isCollapsed ? 'px-2' : 'px-5'}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-[#4b58ff] flex items-center justify-center shrink-0">
                <User className="text-white" size={20} />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {studentData?.student?.name || user?.name || 'طالب'}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {studentData?.student?.level || ''} {studentData?.speciality?.code ? `- ${studentData.speciality.code}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-5 mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1 px-3">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                            active 
                              ? 'bg-[#4b58ff] text-white' 
                              : 'text-muted hover:bg-white/5 hover:text-white'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon size={20} className={active ? 'text-white' : 'group-hover:text-[#4b58ff]'} />
                          {!isCollapsed && (
                            <span className="text-sm font-medium">{item.name}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-white/5 ${isCollapsed ? 'px-2' : 'px-5'}`}>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted hover:bg-red-500/10 hover:text-red-400 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'تسجيل الخروج' : undefined}
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="text-sm font-medium">تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/5">
        <div className="grid grid-cols-5">
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center justify-center py-3 ${
              pathname === '/dashboard' ? 'text-[#4b58ff]' : 'text-muted'
            }`}
          >
            <LayoutDashboard size={22} />
            <span className="text-[10px] mt-1 font-medium">الرئيسية</span>
          </Link>
          <Link 
            href="/dashboard/modules" 
            className={`flex flex-col items-center justify-center py-3 ${
              pathname.includes('/modules') ? 'text-[#4b58ff]' : 'text-muted'
            }`}
          >
            <BookOpen size={22} />
            <span className="text-[10px] mt-1 font-medium">المواد</span>
          </Link>
          <Link 
            href="/features/chatbot" 
            className={`flex flex-col items-center justify-center py-3 ${
              pathname.includes('/chatbot') ? 'text-[#4b58ff]' : 'text-muted'
            }`}
          >
            <MessageSquare size={22} />
            <span className="text-[10px] mt-1 font-medium">المساعد</span>
          </Link>
          <Link 
            href="/features/content-generator" 
            className={`flex flex-col items-center justify-center py-3 ${
              pathname.includes('/content') ? 'text-[#4b58ff]' : 'text-muted'
            }`}
          >
            <Sparkles size={22} />
            <span className="text-[10px] mt-1 font-medium">المولد</span>
          </Link>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex flex-col items-center justify-center py-3 text-muted"
          >
            <Settings size={22} />
            <span className="text-[10px] mt-1 font-medium">المزيد</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Modal */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/80"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="absolute bottom-16 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#4b58ff] flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <p className="font-semibold text-white">
                  {studentData?.student?.name || user?.name || 'طالب'}
                </p>
                <p className="text-sm text-muted">
                  {studentData?.student?.level || ''} - {studentData?.speciality?.code || ''}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {menuItems.flatMap(section => section.items).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      active 
                        ? 'bg-[#4b58ff] text-white' 
                        : 'text-muted hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

