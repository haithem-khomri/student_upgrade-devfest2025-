const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ModuleData {
  module: {
    id: string;
    name: string;
    name_fr: string;
    code: string;
    year: string;
    semester: number;
    credits: number;
    coefficient: number;
    difficulty: number;
    description: string;
  };
  speciality: {
    id: string;
    name: string;
    code: string;
  };
  courses: Course[];
  courses_total_hours: number;
  tds: TD[];
  total_exercises: number;
  exams: Exam[];
  resources: Resource[];
}

export interface Course {
  id: string;
  title: string;
  chapter: number;
  content: string;
  duration_hours: number;
}

export interface TD {
  id: string;
  title: string;
  number: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Exam {
  id: string;
  title: string;
  type: string;
  date: string;
  duration_minutes: number;
  total_points: number;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  text: string;
  points: number;
  type: string;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  channel?: string;
  tags: string[];
  average_rating: number;
  rating_count: number;
  language?: string;
  course_id?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export async function fetchModuleDetails(
  moduleId: string
): Promise<ModuleData> {
  const response = await fetch(`${API_BASE_URL}/api/chat/module/${moduleId}/details`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "فشل تحميل بيانات المادة");
  }
  
  return response.json();
}

export async function loadUserDifficulty(
  userId: string,
  moduleId: string,
  token: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/student/preferences/${userId}/difficulty/${moduleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.difficulty ?? null;
    }
    
    // If 401, token is invalid - silently fail (user can still set difficulty)
    if (response.status === 401) {
      console.warn("Authentication failed when loading difficulty - token may be invalid");
      return null;
    }
    
    return null;
  } catch (error) {
    console.error("Error loading user difficulty:", error);
    return null;
  }
}

export async function saveUserDifficulty(
  userId: string,
  moduleId: string,
  difficulty: number,
  token: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/student/preferences/${userId}/difficulty/${moduleId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ difficulty }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      // Token is invalid or expired - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
    } else if (response.status === 403) {
      throw new Error("ليس لديك صلاحية لتعديل هذا المستوى.");
    } else if (response.status === 500) {
      throw new Error("حدث خطأ في الخادم. يرجى المحاولة لاحقاً.");
    }
    
    throw new Error(errorData.detail || errorData.error || "فشل حفظ مستوى الصعوبة. يرجى المحاولة مرة أخرى.");
  }
}

export async function rateResource(
  userId: string,
  resourceId: string,
  rating: number,
  moduleId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      resource_id: resourceId,
      rating: rating,
      module_id: moduleId,
    }),
  });

  if (!response.ok) {
    throw new Error("فشل تقييم المورد");
  }
}

