// Static mock data - no API calls

export interface StudyDecisionRequest {
  mood: 'low' | 'medium' | 'high';
  energyLevel: number; // 1-10
  timeAvailable: number; // minutes
  modules: Array<{
    id: string;
    name: string;
    difficulty: number; // 1-10
    examDate?: string; // ISO date
    progress?: number; // 0-100
  }>;
}

export interface StudyDecisionResponse {
  recommendedModule: {
    id: string;
    name: string;
    reason: string;
  };
  recommendedActivity: 'revise' | 'practice' | 'flashcards' | 'summary';
  suggestedDuration: number; // minutes
  explanation: string; // AI-generated explanation
  confidence: number; // 0-1
}

export const studyDecisionApi = {
  getRecommendation: async (
    request: StudyDecisionRequest
  ): Promise<StudyDecisionResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple static logic for recommendations
    const { mood, energyLevel, timeAvailable, modules } = request;
    
    // Select module based on simple priority (difficulty vs energy)
    let selectedModule = modules[0];
    if (modules.length > 1) {
      if (energyLevel >= 7) {
        // High energy: pick harder module
        selectedModule = modules.reduce((prev, curr) => 
          curr.difficulty > prev.difficulty ? curr : prev
        );
      } else if (energyLevel <= 4) {
        // Low energy: pick easier module
        selectedModule = modules.reduce((prev, curr) => 
          curr.difficulty < prev.difficulty ? curr : prev
        );
      }
    }
    
    // Determine activity based on energy and time
    let activity: 'revise' | 'practice' | 'flashcards' | 'summary' = 'revise';
    if (energyLevel <= 4 || timeAvailable <= 30) {
      activity = 'flashcards';
    } else if (energyLevel >= 7 && timeAvailable >= 60) {
      activity = 'practice';
    } else if (timeAvailable <= 45) {
      activity = 'summary';
    }
    
    // Calculate duration
    let duration = Math.min(timeAvailable, 60);
    if (energyLevel <= 4) {
      duration = Math.min(duration, 30);
    }
    
    // Activity names in Arabic
    const activityNames: Record<string, string> = {
      revise: 'المراجعة',
      practice: 'التمارين',
      flashcards: 'البطاقات التعليمية',
      summary: 'الملخصات',
    };
    
    // Generate reason
    let reason = '';
    if (selectedModule.examDate) {
      reason = 'امتحان قريب';
    } else if (selectedModule.progress && selectedModule.progress < 50) {
      reason = 'تقدم منخفض';
    } else if (selectedModule.difficulty >= 7) {
      reason = 'مادة صعبة تحتاج اهتمام';
    } else {
      reason = 'وقت مناسب للمراجعة';
    }
    
    return {
      recommendedModule: {
        id: selectedModule.id,
        name: selectedModule.name,
        reason: reason,
      },
      recommendedActivity: activity,
      suggestedDuration: duration,
      explanation: `بناءً على مستوى طاقتك (${energyLevel}/10) والوقت المتاح (${timeAvailable} دقيقة)، ننصحك بـ${activityNames[activity]} لمادة ${selectedModule.name}. ${reason === 'امتحان قريب' ? 'لديك امتحان قريب لذا يجب التركيز على هذه المادة.' : 'هذا سيساعدك على تحسين فهمك للمادة.'}`,
      confidence: 0.85,
    };
  },
};
