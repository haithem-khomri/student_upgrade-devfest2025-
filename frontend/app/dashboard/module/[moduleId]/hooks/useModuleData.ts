import { useState, useEffect, useCallback } from "react";
import {
  fetchModuleDetails,
  loadUserDifficulty,
  saveUserDifficulty,
  type ModuleData,
} from "../utils/api";
import { isDemoToken } from "@/lib/utils/auth";

interface UseModuleDataProps {
  moduleId: string;
  userId?: string;
  token?: string;
  isAuthenticated: boolean;
}

export function useModuleData({
  moduleId,
  userId,
  token,
  isAuthenticated,
}: UseModuleDataProps) {
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDifficulty, setUserDifficulty] = useState<number | null>(null);
  const [savingDifficulty, setSavingDifficulty] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!moduleId || !isAuthenticated) return;

      try {
        setLoading(true);
        const data = await fetchModuleDetails(moduleId);
        setModuleData(data);

        if (userId && token) {
          const difficulty = await loadUserDifficulty(userId, moduleId, token);
          if (difficulty !== null) {
            setUserDifficulty(difficulty);
          }
        }
      } catch (err) {
        console.error("Error fetching module data:", err);
        setError(
          err instanceof Error ? err.message : "حدث خطأ في تحميل البيانات"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, isAuthenticated, userId, token]);

  const handleSaveDifficulty = useCallback(
    async (difficulty: number) => {
      if (!userId || !moduleId || !token) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // Check if token is a demo/mock token
      if (isDemoToken(token)) {
        throw new Error("يجب تسجيل الدخول باستخدام حساب حقيقي لتعديل مستوى الصعوبة. يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى.");
      }

      setSavingDifficulty(true);
      try {
        await saveUserDifficulty(userId, moduleId, difficulty, token);
        setUserDifficulty(difficulty);
      } catch (error) {
        throw error;
      } finally {
        setSavingDifficulty(false);
      }
    },
    [userId, moduleId, token]
  );

  return {
    moduleData,
    loading,
    error,
    userDifficulty,
    savingDifficulty,
    handleSaveDifficulty,
  };
}

