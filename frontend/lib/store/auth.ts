import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  level?: string;
  modules?: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
          }

          const data = await response.json();
          
          // Store the real JWT token from backend
          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            level: data.user.level || undefined,
            modules: data.user.modules || undefined,
          };

          set({
            isAuthenticated: true,
            user: user,
            token: data.access_token, // Real JWT token from backend
          });
        } catch (error) {
          // If API call fails, fall back to demo mode for development
          console.warn('API login failed, using demo mode:', error);
          
          const demoUsers: Record<string, User> = {
            'demo@student.ai': {
              id: '1',
              name: 'مستخدم تجريبي',
              email: 'demo@student.ai',
              level: 'L2',
              modules: ['bdd_l2_s1', 'se1_l2_s1'],
            },
            'student1_l1@univ-alger.dz': {
              id: '2',
              name: 'عمر بن سعيد',
              email: 'student1_l1@univ-alger.dz',
              level: 'L1',
              modules: ['algo1_l1_s1', 'prog1_l1_s1', 'math1_l1_s1', 'analyse1_l1_s1', 'archi_l1_s1'],
            },
            'student2_m1@univ-alger.dz': {
              id: '3',
              name: 'سارة خليفي',
              email: 'student2_m1@univ-alger.dz',
              level: 'M1',
              modules: ['ml_m1_s1'],
            },
          };
          
          const user = demoUsers[email];
          if (user) {
            set({
              isAuthenticated: true,
              user: user,
              token: 'demo-token-' + user.id, // Demo token (won't work with protected endpoints)
            });
          } else {
            throw new Error('فشل تسجيل الدخول. يرجى التحقق من اتصالك بالإنترنت.');
          }
        }
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },
      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
