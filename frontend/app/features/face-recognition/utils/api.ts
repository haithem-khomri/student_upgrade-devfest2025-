"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface FaceStatusResponse {
  registered: boolean;
  registered_at: string | null;
  poster_verified: boolean;
  error?: string;
}

export interface FaceDetectionResponse {
  success: boolean;
  error?: string;
  faces: Array<{
    bbox: { x: number; y: number; width: number; height: number };
    confidence: number;
    embedding?: number[];
    emotions?: {
      emotion: string;
      mood: string;
      confidence: number;
      all_emotions: Record<string, number>;
    };
  }>;
  face_count?: number;
}

export interface FaceVerificationResponse {
  verified: boolean;
  similarity: number;
  confidence: number;
  emotions?: {
    emotion: string;
    mood: string;
    confidence: number;
    all_emotions?: Record<string, number>;
  };
}

export interface FaceAnalysisResponse {
  face_detected: boolean;
  face_count: number;
  emotion?: string;
  emotions?: {
    emotion: string;
    mood: string;
    confidence: number;
    all_emotions: Record<string, number>;
  };
  mood?: string;
  confidence?: number;
  emotion_confidence?: number;
  mood_tracked?: boolean;
  error?: string;
}

export interface FaceRegistrationResponse {
  success: boolean;
  message: string;
  poster_verified: boolean;
  emotions?: {
    emotion: string;
    mood: string;
    confidence: number;
    all_emotions: Record<string, number>;
  };
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) return null;
  try {
    const parsed = JSON.parse(authStorage);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
}

function convertImageToBase64(imageData: string): string {
  // Remove data URL prefix if present
  if (imageData.includes(",")) {
    return imageData.split(",")[1];
  }
  return imageData;
}

export async function getFaceStatus(
  token: string
): Promise<FaceStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/face/status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // Return default status on error
    return {
      registered: false,
      registered_at: null,
      poster_verified: false,
    };
  }

  return response.json();
}

export async function detectFaces(
  imageData: string,
  token: string
): Promise<FaceDetectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/face/detect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: convertImageToBase64(imageData),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل اكتشاف الوجه");
  }

  return response.json();
}

export async function analyzeFace(
  imageData: string,
  token: string
): Promise<FaceAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/face/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: convertImageToBase64(imageData),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل تحليل الوجه");
  }

  return response.json();
}

export async function registerFace(
  imageData: string,
  posterImageData: string | null,
  token: string
): Promise<FaceRegistrationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/face/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: convertImageToBase64(imageData),
      poster_image: posterImageData
        ? convertImageToBase64(posterImageData)
        : null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.detail || "فشل تسجيل الوجه";
    
    // Provide more specific error messages
    if (response.status === 503 && errorMessage.includes("MongoDB")) {
      throw new Error("خدمة قاعدة البيانات غير متاحة. يرجى المحاولة لاحقاً.");
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function verifyFace(
  imageData: string,
  token: string
): Promise<FaceVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/face/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: convertImageToBase64(imageData),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل التحقق من الوجه");
  }

  return response.json();
}

// Mood Tracking APIs
export interface MoodEntry {
  _id?: string;
  user_email: string;
  emotion: string;
  mood: string;
  confidence: number;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MoodHistoryResponse {
  success: boolean;
  mood_history: MoodEntry[];
  analysis: {
    total_entries: number;
    most_common_mood: string;
    recent_mood: string;
    mood_distribution: Record<string, number>;
    average_confidence: number;
    trend: string;
    recent_entries_count: number;
  };
  insights: string[];
  total_entries: number;
}

export interface MoodStatsResponse {
  success: boolean;
  stats: {
    total_entries: number;
    most_common_mood: string;
    recent_mood: string;
    mood_distribution: Record<string, number>;
    average_confidence: number;
    trend: string;
    recent_entries_count: number;
  };
  insights: string[];
  period_days: number;
}

export async function getMoodHistory(
  token: string,
  days: number = 7,
  limit: number = 100
): Promise<MoodHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/mood/history?days=${days}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل جلب تاريخ المزاج");
  }

  return response.json();
}

export async function getMoodStats(
  token: string,
  days: number = 30
): Promise<MoodStatsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/mood/stats?days=${days}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل جلب إحصائيات المزاج");
  }

  return response.json();
}

// Mood-Based Program APIs
export interface StudyProgram {
  _id?: string;
  user_email: string;
  mood_based: boolean;
  dominant_mood: string;
  current_mood: string;
  mood_analysis: any;
  template: {
    name: string;
    description: string;
    daily_duration_minutes: number;
    session_duration_minutes: number;
    break_duration_minutes: number;
    focus_areas: string[];
    difficulty_level: string;
    modules_count: number;
  };
  selected_modules: any[];
  daily_schedule: Array<{
    day: number;
    date: string;
    total_duration_minutes: number;
    sessions: Array<{
      session_number: number;
      start_time: string;
      duration_minutes: number;
      focus_area: string;
    }>;
  }>;
  total_days: number;
  created_at: string;
  status?: string;
  recommendations: string[];
}

export interface GenerateProgramRequest {
  days: number;
  include_modules?: string[];
}

export interface GenerateProgramResponse {
  success: boolean;
  program: StudyProgram;
  message: string;
}

export async function generateMoodBasedProgram(
  token: string,
  request: GenerateProgramRequest
): Promise<GenerateProgramResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/mood/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل إنشاء البرنامج الدراسي");
  }

  return response.json();
}

export async function getStudyPrograms(
  token: string,
  activeOnly: boolean = true
): Promise<{ success: boolean; programs: StudyProgram[]; count: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/mood/programs?active_only=${activeOnly}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "فشل جلب البرامج الدراسية");
  }

  return response.json();
}

