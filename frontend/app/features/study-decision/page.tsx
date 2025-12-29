'use client';

import { useState } from 'react';
import { ArrowRight, Brain, Clock, BookOpen, Sparkles, Zap, Camera } from 'lucide-react';
import Link from 'next/link';
import { studyDecisionApi, StudyDecisionRequest } from '@/lib/api/study-decision';
import MoodDetector from '@/app/components/MoodDetector';

interface MoodResult {
  emotion: string;
  mood: string;
  confidence: number;
  all_emotions: Record<string, number>;
}

export default function StudyDecisionPage() {
  const [mood, setMood] = useState<'low' | 'medium' | 'high'>('medium');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [timeAvailable, setTimeAvailable] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [showMoodDetector, setShowMoodDetector] = useState(false);
  const [detectedMood, setDetectedMood] = useState<MoodResult | null>(null);

  const modules = [
    { id: '1', name: 'الرياضيات', difficulty: 8, examDate: '2025-02-15', progress: 60 },
    { id: '2', name: 'الفيزياء', difficulty: 7, examDate: '2025-02-20', progress: 45 },
    { id: '3', name: 'علوم الحاسوب', difficulty: 6, examDate: '2025-02-18', progress: 70 },
  ];

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    try {
      const request: StudyDecisionRequest = {
        mood,
        energyLevel,
        timeAvailable,
        modules,
      };

      const result = await studyDecisionApi.getRecommendation(request);
      setRecommendation(result);
    } catch (error) {
      console.error('فشل الحصول على التوصية:', error);
      alert('فشل الحصول على التوصية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const moodLabels = { low: 'منخفض', medium: 'متوسط', high: 'مرتفع' };
  const moodEmojis = { low: '😴', medium: '😊', high: '🚀' };

  // Map detected mood to our mood levels
  const mapDetectedMoodToLevel = (detectedMood: string): 'low' | 'medium' | 'high' => {
    if (detectedMood === 'positive') return 'high';
    if (detectedMood === 'negative') return 'low';
    return 'medium'; // calm or neutral
  };

  const handleMoodDetected = (result: MoodResult) => {
    setDetectedMood(result);
    const mappedMood = mapDetectedMoodToLevel(result.mood);
    setMood(mappedMood);
    setShowMoodDetector(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 relative overflow-hidden">
      {/* Mood Detector Modal */}
      {showMoodDetector && (
        <MoodDetector
          onMoodDetected={handleMoodDetected}
          onClose={() => setShowMoodDetector(false)}
          autoStart={true}
        />
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-20" />
      <div className="fixed top-40 left-20 w-96 h-96 bg-[#4b58ff]/8 rounded-full blur-[150px]" />

      {/* Header */}
      <header className="glass px-5 lg:px-8 flex items-center gap-4 h-16 relative z-10">
        <Link href="/dashboard" className="btn btn-ghost px-2 py-1.5">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4b58ff] flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold text-white">قرارات الدراسة</h1>
        </div>
      </header>

      <main className="container-desktop py-10 relative z-10">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Input Section */}
          <div className="card-glass space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-[#4b58ff]" size={22} />
              <h2 className="text-xl font-bold text-white">كيف تشعر الآن؟</h2>
            </div>

            {/* Mood Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-white">المزاج</label>
                <button
                  onClick={() => setShowMoodDetector(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4b58ff]/20 hover:bg-[#4b58ff]/30 text-[#4b58ff] border border-[#4b58ff]/30 transition-colors text-sm font-medium"
                >
                  <Camera size={16} />
                  كشف من الكاميرا
                </button>
              </div>
              
              {/* Detected Mood Display */}
              {detectedMood && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {detectedMood.mood === 'positive' ? '😊' : 
                         detectedMood.mood === 'negative' ? '😔' : 
                         detectedMood.mood === 'calm' ? '😌' : '😐'}
                      </span>
                      <div>
                        <p className="text-white font-semibold">
                          {detectedMood.mood === 'positive' ? 'مزاج إيجابي' : 
                           detectedMood.mood === 'negative' ? 'مزاج سلبي' : 
                           detectedMood.mood === 'calm' ? 'مزاج هادئ' : 'مزاج عادي'}
                        </p>
                        <p className="text-muted text-xs">
                          المشاعر: {detectedMood.emotion} • الثقة: {Math.round(detectedMood.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDetectedMood(null);
                        setMood('medium');
                      }}
                      className="text-muted hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {(['low', 'medium', 'high'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMood(m);
                      setDetectedMood(null); // Clear detected mood when manually selecting
                    }}
                    className={`py-5 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                      mood === m
                        ? 'bg-[#4b58ff] text-white glow'
                        : 'bg-white/[0.03] text-white border border-white/10 hover:border-[#4b58ff]/30'
                    }`}
                  >
                    <span className="text-2xl">{moodEmojis[m]}</span>
                    <span className="text-sm">{moodLabels[m]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-white">
                مستوى الطاقة: <span className="text-[#4b58ff]">{energyLevel}/10</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-muted">⚡</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4b58ff] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-muted">🔥</span>
              </div>
            </div>

            {/* Time Available */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-white">
                الوقت المتاح: <span className="text-[#4b58ff]">{timeAvailable} دقيقة</span>
              </label>
              <div className="flex items-center gap-4">
                <Clock className="text-muted" size={18} />
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4b58ff] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleGetRecommendation}
              disabled={isLoading}
              className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحليل...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Zap size={20} />
                  احصل على توصية ذكية
                </span>
              )}
            </button>
          </div>

          {/* Recommendation Result */}
          {recommendation && (
            <div className="card-glass space-y-6 animate-slideUp">
              <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                <div className="feature-icon w-14 h-14 rounded-2xl">
                  <Brain className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">توصية الذكاء الاصطناعي</h2>
                  <p className="text-sm text-muted font-light">بناءً على حالتك الحالية</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#4b58ff]/10 border border-[#4b58ff]/20">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={24} className="text-[#4b58ff]" />
                  <h3 className="text-lg font-bold text-white">
                    {recommendation.recommendedModule.name}
                  </h3>
                </div>
                <p className="text-muted font-light">{recommendation.recommendedModule.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-muted mb-2">
                    <Clock size={18} />
                    <span className="text-sm font-medium">المدة المقترحة</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {recommendation.suggestedDuration} <span className="text-sm font-normal text-muted">دقيقة</span>
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-muted mb-2">
                    <Sparkles size={18} />
                    <span className="text-sm font-medium">النشاط</span>
                  </div>
                  <p className="text-lg font-bold text-[#4b58ff]">{recommendation.recommendedActivity}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h4 className="font-semibold text-white mb-3">الشرح</h4>
                <p className="text-muted font-light leading-relaxed">{recommendation.explanation}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">نسبة الثقة</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4b58ff] rounded-full transition-all"
                      style={{ width: `${recommendation.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[#4b58ff] font-bold">
                    {Math.round(recommendation.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
