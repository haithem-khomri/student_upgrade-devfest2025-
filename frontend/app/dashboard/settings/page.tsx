'use client';

import { useState } from 'react';
import { Settings, User, Bell, Moon, Globe, Lock, Save, LogOut } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useAuthStore } from '@/lib/store/auth';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('ar');

  return (
    <DashboardLayout 
      title="الإعدادات"
      subtitle="تخصيص تجربتك"
    >
      {/* Profile Section */}
      <div className="card-glass p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="text-[#4b58ff]" size={20} />
          الملف الشخصي
        </h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#4b58ff] flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg">{user?.name || 'مستخدم'}</h4>
            <p className="text-muted">{user?.email || 'email@example.com'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">الاسم الكامل</label>
            <input 
              type="text"
              defaultValue={user?.name || ''}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">البريد الإلكتروني</label>
            <input 
              type="email"
              defaultValue={user?.email || ''}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card-glass p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="text-[#4b58ff]" size={20} />
          التفضيلات
        </h3>
        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="text-muted" size={20} />
              <div>
                <p className="text-white font-medium">الإشعارات</p>
                <p className="text-sm text-muted">تلقي إشعارات عن المواعيد والتحديثات</p>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-[#4b58ff]' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications ? '-translate-x-6' : '-translate-x-0.5'}`} />
            </button>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Moon className="text-muted" size={20} />
              <div>
                <p className="text-white font-medium">الوضع الداكن</p>
                <p className="text-sm text-muted">تفعيل المظهر الداكن للتطبيق</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-[#4b58ff]' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? '-translate-x-6' : '-translate-x-0.5'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Globe className="text-muted" size={20} />
              <div>
                <p className="text-white font-medium">اللغة</p>
                <p className="text-sm text-muted">اختيار لغة الواجهة</p>
              </div>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg focus:outline-none"
            >
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card-glass p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="text-[#4b58ff]" size={20} />
          الأمان
        </h3>
        <button className="w-full p-4 bg-white/5 rounded-xl text-right hover:bg-white/10 transition-colors">
          <p className="text-white font-medium">تغيير كلمة المرور</p>
          <p className="text-sm text-muted">تحديث كلمة المرور الخاصة بك</p>
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 btn btn-primary flex items-center justify-center gap-2">
          <Save size={18} />
          حفظ التغييرات
        </button>
        <button 
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="flex-1 btn bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </DashboardLayout>
  );
}

