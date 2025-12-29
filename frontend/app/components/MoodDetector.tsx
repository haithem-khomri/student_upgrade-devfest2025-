"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Smile, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { useCamera } from "@/app/features/face-recognition/hooks/useCamera";
import { analyzeFace } from "@/app/features/face-recognition/utils/api";
import { useAuthStore } from "@/lib/store/auth";

interface MoodDetectorProps {
  onMoodDetected: (mood: MoodResult) => void;
  onClose?: () => void;
  autoStart?: boolean;
}

interface MoodResult {
  emotion: string;
  mood: string;
  confidence: number;
  all_emotions: Record<string, number>;
}

export default function MoodDetector({
  onMoodDetected,
  onClose,
  autoStart = true,
}: MoodDetectorProps) {
  const { token } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const {
    videoRef,
    canvasRef,
    isActive,
    videoReady,
    error: cameraError,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera({
    autoStart: autoStart,
    onError: (err) => setError(err),
  });

  // Auto-detect mood when camera is ready
  useEffect(() => {
    if (videoReady && isActive && !isDetecting && !moodResult && !isProcessing) {
      const timer = setTimeout(() => {
        handleDetectMood();
      }, 2000); // Wait 2 seconds for camera to stabilize
      
      return () => clearTimeout(timer);
    }
  }, [videoReady, isActive, isDetecting, moodResult, isProcessing]);

  const handleDetectMood = useCallback(async () => {
    if (!videoReady || !isActive || isProcessing || !token) {
      return;
    }

    setIsDetecting(true);
    setIsProcessing(true);
    setError(null);

    try {
      // Capture image from camera
      const imageData = captureImage();
      if (!imageData) {
        throw new Error("فشل التقاط الصورة من الكاميرا");
      }

      // Analyze face and mood
      const analysis = await analyzeFace(imageData, token);

      if (analysis.face_detected && analysis.emotions) {
        const result: MoodResult = {
          emotion: analysis.emotion || analysis.emotions.emotion || "neutral",
          mood: analysis.mood || analysis.emotions.mood || "neutral",
          confidence: analysis.emotion_confidence || analysis.emotions.confidence || 0,
          all_emotions: analysis.emotions.all_emotions || {},
        };

        setMoodResult(result);
        setIsDetecting(false);
        setIsProcessing(false);
        
        // Call callback after a short delay to show result
        setTimeout(() => {
          onMoodDetected(result);
          stopCamera();
        }, 2000);
      } else {
        throw new Error("لم يتم اكتشاف وجه. تأكد من أن وجهك مرئي في الكاميرا.");
      }
    } catch (err: any) {
      console.error("Error detecting mood:", err);
      setError(err.message || "فشل كشف المزاج. يرجى المحاولة مرة أخرى.");
      setIsDetecting(false);
      setIsProcessing(false);
    }
  }, [videoReady, isActive, isProcessing, token, captureImage, onMoodDetected, stopCamera]);

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      positive: "😊",
      negative: "😔",
      calm: "😌",
      neutral: "😐",
    };
    return moodEmojis[mood] || "😐";
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      positive: "text-green-400",
      negative: "text-red-400",
      calm: "text-blue-400",
      neutral: "text-gray-400",
    };
    return moodColors[mood] || "text-gray-400";
  };

  const getMoodLabel = (mood: string) => {
    const moodLabels: Record<string, string> = {
      positive: "مزاج إيجابي",
      negative: "مزاج سلبي",
      calm: "مزاج هادئ",
      neutral: "مزاج عادي",
    };
    return moodLabels[mood] || "مزاج عادي";
  };

  // Show result screen
  if (moodResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6 animate-slideUp">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">تم كشف المزاج!</h2>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{getMoodEmoji(moodResult.mood)}</div>
              <h3 className={`text-2xl font-bold ${getMoodColor(moodResult.mood)}`}>
                {getMoodLabel(moodResult.mood)}
              </h3>
              <p className="text-muted mt-2">
                المشاعر: {moodResult.emotion} • الثقة: {Math.round(moodResult.confidence * 100)}%
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onMoodDetected(moodResult);
                  stopCamera();
                }}
                className="w-full py-3 px-6 bg-[#4b58ff] hover:bg-[#3d47cc] text-white rounded-xl font-semibold transition-colors"
              >
                استخدام هذا المزاج
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen
  if (error || cameraError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="text-red-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">خطأ</h2>
            <p className="text-muted">{error || cameraError}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                startCamera();
              }}
              className="flex-1 py-3 px-6 bg-[#4b58ff] hover:bg-[#3d47cc] text-white rounded-xl font-semibold transition-colors"
            >
              إعادة المحاولة
            </button>
            {onClose && (
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show camera view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#4b58ff]/20 flex items-center justify-center">
              <Camera className="text-[#4b58ff]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">كشف المزاج من الكاميرا</h2>
              <p className="text-sm text-muted">
                {isProcessing ? "جاري التحليل..." : videoReady ? "انظر إلى الكاميرا" : "جاري تهيئة الكاميرا..."}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Camera View */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
          {isActive && videoRef.current && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                transform: "scaleX(-1)", // Mirror for better UX
              }}
            />
          )}
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-[#4b58ff] mx-auto" />
                <p className="text-muted">جاري تهيئة الكاميرا...</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-[#4b58ff] mx-auto" />
                <p className="text-white font-semibold">جاري تحليل المشاعر...</p>
              </div>
            </div>
          )}

          {/* Face detection indicator */}
          {videoReady && !isProcessing && (
            <div className="absolute top-4 left-4 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">الكاميرا جاهزة</span>
            </div>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Smile className="text-blue-400 mt-0.5" size={20} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-white">تعليمات</p>
              <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                <li>تأكد من أن وجهك مرئي بوضوح في الكاميرا</li>
                <li>تأكد من وجود إضاءة كافية</li>
                <li>سيتم الكشف تلقائياً عندما تكون الكاميرا جاهزة</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Manual capture button (optional) */}
        {videoReady && !isProcessing && (
          <button
            onClick={handleDetectMood}
            disabled={!videoReady || isProcessing}
            className="w-full py-3 px-6 bg-[#4b58ff] hover:bg-[#3d47cc] text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            كشف المزاج الآن
          </button>
        )}
      </div>
    </div>
  );
}
