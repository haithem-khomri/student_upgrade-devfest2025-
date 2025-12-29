"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { isDemoToken } from "@/lib/utils/auth";
import DashboardLayout from "@/app/components/DashboardLayout";
import DifficultyModal from "./components/DifficultyModal";
import FlashcardsModal from "./components/FlashcardsModal";
import QuizModal from "./components/QuizModal";
import ModuleHeader from "./components/ModuleHeader";
import AIToolsSection from "./components/AIToolsSection";
import ModuleTabs from "./components/ModuleTabs";
import TabContent from "./components/TabContent";
import ResourcesSection from "./components/ResourcesSection";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import { useModuleData } from "./hooks/useModuleData";
import { useAIGeneration } from "./hooks/useAIGeneration";
import { useResourceRating } from "./hooks/useResourceRating";

type TabType = "courses" | "tds" | "exams";

export default function ModuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;
  const { isAuthenticated, user, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>("courses");
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  const {
    moduleData,
    loading,
    error,
    userDifficulty,
    savingDifficulty,
    handleSaveDifficulty,
  } = useModuleData({
    moduleId,
    userId: user?.id,
    token: token || undefined,
    isAuthenticated,
  });

  const {
    flashcards,
    quizQuestions,
    generatingAI,
    showFlashcards,
    showQuiz,
    generateFlashcards,
    generateQuiz,
    resetQuiz,
    resetFlashcards,
  } = useAIGeneration(moduleData);

  const { userRatings, ratingLoading, handleRateResource } = useResourceRating({
    userId: user?.email,
    moduleId,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  const handleSaveDifficultyWithModal = async (difficulty: number) => {
    // Check if using demo token
    if (token && isDemoToken(token)) {
      alert(
        "يجب تسجيل الدخول باستخدام حساب حقيقي لتعديل مستوى الصعوبة. سيتم توجيهك إلى صفحة تسجيل الدخول."
      );
      useAuthStore.getState().logout();
      router.push("/auth/login");
      return;
    }

    try {
      await handleSaveDifficulty(difficulty);
      setShowDifficultyModal(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ في حفظ مستوى الصعوبة";
      alert(errorMessage);

      // If authentication error, clear auth and redirect to login
      if (
        errorMessage.includes("انتهت صلاحية") ||
        errorMessage.includes("تسجيل الدخول") ||
        errorMessage.includes("Invalid authentication")
      ) {
        useAuthStore.getState().logout();
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
    }
  };

  const handleQuizClose = () => {
    resetQuiz();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error || !moduleData) {
    return <ErrorState error={error} />;
  }

  return (
    <DashboardLayout
      title={moduleData.module.name}
      subtitle={`${moduleData.module.code} • ${moduleData.module.credits} رصيد`}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowRight size={18} />
        <span>العودة للوحة التحكم</span>
      </Link>

      <ModuleHeader
        moduleData={moduleData}
        userDifficulty={userDifficulty}
        onDifficultyClick={() => {
          if (token && isDemoToken(token)) {
            alert(
              "يجب تسجيل الدخول باستخدام حساب حقيقي لتعديل مستوى الصعوبة. سيتم توجيهك إلى صفحة تسجيل الدخول."
            );
            useAuthStore.getState().logout();
            router.push("/auth/login");
            return;
          }
          setShowDifficultyModal(true);
        }}
      />

      <AIToolsSection
        onGenerateFlashcards={generateFlashcards}
        onGenerateQuiz={generateQuiz}
        generatingAI={generatingAI}
      />

      <ModuleTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        moduleData={moduleData}
      />

      <div className="space-y-4">
        <TabContent activeTab={activeTab} moduleData={moduleData} />
      </div>

      <ResourcesSection
        resources={moduleData.resources}
        userRatings={userRatings}
        ratingLoading={ratingLoading}
        onRateResource={handleRateResource}
      />

      <FlashcardsModal
        isOpen={showFlashcards}
        onClose={resetFlashcards}
        flashcards={flashcards}
      />

      <DifficultyModal
        isOpen={showDifficultyModal}
        onClose={() => setShowDifficultyModal(false)}
        currentDifficulty={userDifficulty}
        moduleDifficulty={moduleData.module.difficulty}
        onSave={handleSaveDifficultyWithModal}
        isSaving={savingDifficulty}
      />

      <QuizModal
        isOpen={showQuiz}
        onClose={handleQuizClose}
        questions={quizQuestions}
      />
    </DashboardLayout>
  );
}
