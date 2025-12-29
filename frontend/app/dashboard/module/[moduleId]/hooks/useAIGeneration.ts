import { useState, useCallback } from "react";
import type { ModuleData, Flashcard, QuizQuestion } from "../utils/api";

export function useAIGeneration(moduleData: ModuleData | null) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const generateFlashcards = useCallback(async () => {
    if (!moduleData) return;

    setGeneratingAI(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedCards: Flashcard[] = moduleData.courses.map(
      (course, index) => ({
        id: `fc-${index}`,
        front: `ما هو محتوى ${course.title}؟`,
        back: course.content || `${course.title} - الفصل ${course.chapter}`,
      })
    );

    moduleData.tds.forEach((td, index) => {
      td.exercises.forEach((ex, exIndex) => {
        generatedCards.push({
          id: `fc-td-${index}-${exIndex}`,
          front: ex.title,
          back: ex.description,
        });
      });
    });

    setFlashcards(generatedCards.slice(0, 10));
    setShowFlashcards(true);
    setGeneratingAI(false);
  }, [moduleData]);

  const generateQuiz = useCallback(async () => {
    if (!moduleData) return;

    setGeneratingAI(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const questions: QuizQuestion[] = [];

    moduleData.courses.forEach((course, index) => {
      questions.push({
        id: `q-${index}`,
        question: `ما هو موضوع الفصل ${course.chapter}؟`,
        options: [course.title, "موضوع آخر", "لا يوجد", "غير محدد"],
        correctIndex: 0,
      });
    });

    moduleData.exams.forEach((exam) => {
      exam.questions.slice(0, 2).forEach((q, index) => {
        questions.push({
          id: `eq-${exam.id}-${index}`,
          question: q.text,
          options: [
            "الإجابة الصحيحة",
            "إجابة خاطئة 1",
            "إجابة خاطئة 2",
            "إجابة خاطئة 3",
          ],
          correctIndex: 0,
        });
      });
    });

    setQuizQuestions(questions.slice(0, 5));
    setShowQuiz(true);
    setGeneratingAI(false);
  }, [moduleData]);

  const resetQuiz = useCallback(() => {
    setShowQuiz(false);
  }, []);

  const resetFlashcards = useCallback(() => {
    setShowFlashcards(false);
  }, []);

  return {
    flashcards,
    quizQuestions,
    generatingAI,
    showFlashcards,
    showQuiz,
    generateFlashcards,
    generateQuiz,
    resetQuiz,
    resetFlashcards,
  };
}

