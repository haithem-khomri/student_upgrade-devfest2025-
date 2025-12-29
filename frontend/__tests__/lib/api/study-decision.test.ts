import { studyDecisionApi } from '@/lib/api/study-decision'

describe('Study Decision API', () => {
  it('should return recommendation for high energy', async () => {
    const request = {
      mood: 'high' as const,
      energyLevel: 8,
      timeAvailable: 60,
      modules: [
        { id: '1', name: 'Math', difficulty: 8, progress: 50 },
        { id: '2', name: 'Physics', difficulty: 6, progress: 70 },
      ],
    }

    const result = await studyDecisionApi.getRecommendation(request)

    expect(result).toBeDefined()
    expect(result.recommendedModule).toBeDefined()
    expect(result.recommendedActivity).toBeDefined()
    expect(result.suggestedDuration).toBeGreaterThan(0)
    expect(result.explanation).toBeDefined()
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('should recommend flashcards for low energy', async () => {
    const request = {
      mood: 'low' as const,
      energyLevel: 3,
      timeAvailable: 30,
      modules: [
        { id: '1', name: 'Math', difficulty: 8, progress: 50 },
      ],
    }

    const result = await studyDecisionApi.getRecommendation(request)

    expect(result.recommendedActivity).toBe('flashcards')
    expect(result.suggestedDuration).toBeLessThanOrEqual(30)
  })

  it('should recommend practice for high energy and long time', async () => {
    const request = {
      mood: 'high' as const,
      energyLevel: 9,
      timeAvailable: 90,
      modules: [
        { id: '1', name: 'Math', difficulty: 8, progress: 50 },
      ],
    }

    const result = await studyDecisionApi.getRecommendation(request)

    expect(result.recommendedActivity).toBe('practice')
  })

  it('should prioritize module with upcoming exam', async () => {
    const request = {
      mood: 'medium' as const,
      energyLevel: 5,
      timeAvailable: 60,
      modules: [
        { id: '1', name: 'Math', difficulty: 8, examDate: '2025-02-15', progress: 50 },
        { id: '2', name: 'Physics', difficulty: 6, progress: 70 },
      ],
    }

    const result = await studyDecisionApi.getRecommendation(request)

    expect(result.recommendedModule.reason).toContain('امتحان')
  })
})

