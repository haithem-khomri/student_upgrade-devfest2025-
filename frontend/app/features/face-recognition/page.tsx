"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  User,
  Smile,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { useCamera } from "./hooks/useCamera";
import {
  getFaceStatus,
  detectFaces,
  analyzeFace,
  registerFace,
  verifyFace,
  type FaceDetectionResponse,
  type FaceVerificationResponse,
  type FaceAnalysisResponse,
} from "./utils/api";

export default function FaceRecognitionPage() {
  const [mounted, setMounted] = useState(false);
  const { user, token } = useAuthStore();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] =
    useState<FaceDetectionResponse | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<FaceVerificationResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const {
    stream,
    videoRef,
    canvasRef,
    isActive,
    videoReady,
    error: cameraError,
    startCamera,
    stopCamera,
    captureImage,
    testCapture,
  } = useCamera({
    autoStart: false,
    onError: (err) => setError(err),
    onStreamReady: (stream) => {
      console.log("Camera stream ready:", stream);
      const tracks = stream.getVideoTracks();
      tracks.forEach((track) => {
        const settings = track.getSettings();
        console.log("Video track:", {
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: settings,
          width: settings.width,
          height: settings.height,
        });
      });
      // IMPORTANT: Don't call stopCamera here - the stream is active and needed!
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !token) return;
    checkFaceStatus();
  }, [mounted, token]);

  const checkFaceStatus = useCallback(async () => {
    if (!token) return;

    setIsLoadingStatus(true);
    try {
      const status = await getFaceStatus(token);
      setFaceRegistered(status.registered || false);
    } catch (err) {
      console.error("Error checking face status:", err);
      setFaceRegistered(false);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [token]);

  const handleCapture = useCallback(() => {
    if (!videoReady || !isActive) {
      setError("الكاميرا غير جاهزة. يرجى الانتظار...");
      return;
    }

    console.log("Attempting to capture image...");
    const image = captureImage();
    if (image) {
      console.log("Image captured successfully, length:", image.length);
      setCapturedImage(image);
      setError(null);
    } else {
      console.error("Failed to capture image");
      setError("فشل التقاط الصورة. يرجى المحاولة مرة أخرى.");
    }
  }, [videoReady, isActive, captureImage]);

  const handleTestCapture = useCallback(() => {
    console.log("Testing camera capture...");
    const video = videoRef.current;
    if (!video) {
      setError("عنصر الفيديو غير متاح");
      return;
    }

    console.log("Video element state:", {
      readyState: video.readyState,
      width: video.videoWidth,
      height: video.videoHeight,
      paused: video.paused,
      srcObject: !!video.srcObject,
    });

    const success = testCapture();
    if (success) {
      alert("✅ اختبار الكاميرا نجح! الكاميرا تعمل بشكل صحيح.");
    } else {
      alert("❌ اختبار الكاميرا فشل. تحقق من حالة الكاميرا.");
    }
  }, [testCapture]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, type: "capture" | "poster") => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (type === "capture") {
          setCapturedImage(imageData);
          setError(null);
        } else {
          setPosterImage(imageData);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleDetectFaces = useCallback(async () => {
    if (!capturedImage || !token) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await detectFaces(capturedImage, token);
      setDetectionResult(result);
    } catch (err: any) {
      setError(err.message || "فشل اكتشاف الوجه");
      console.error("Error detecting faces:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, token]);

  const handleAnalyzeFace = useCallback(async () => {
    if (!capturedImage || !token) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await analyzeFace(capturedImage, token);
      setDetectionResult({
        success: result.face_detected,
        faces: result.face_detected
          ? [
              {
                bbox: { x: 0, y: 0, width: 0, height: 0 },
                confidence: result.confidence || 0,
                emotions: result.emotions,
              },
            ]
          : [],
        face_count: result.face_count || 0,
      });
    } catch (err: any) {
      setError(err.message || "فشل تحليل الوجه");
      console.error("Error analyzing face:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, token]);

  const handleRegisterFace = useCallback(async () => {
    if (!capturedImage || !token) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await registerFace(capturedImage, posterImage, token);
      setFaceRegistered(true);
      setError(null);
      alert("تم تسجيل الوجه بنجاح!");
      if (result.poster_verified) {
        alert("تم التحقق من مطابقة الوجه مع الصورة المرجعية!");
      }
      await checkFaceStatus();
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الوجه");
      console.error("Error registering face:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, posterImage, token, checkFaceStatus]);

  const handleVerifyFace = useCallback(async () => {
    if (!capturedImage || !token) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await verifyFace(capturedImage, token);
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message || "فشل التحقق من الوجه");
      console.error("Error verifying face:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, token]);

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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#4b58ff]" size={48} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Status Card */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  faceRegistered
                    ? "bg-green-500/20"
                    : "bg-yellow-500/20"
                }`}
              >
                {isLoadingStatus ? (
                  <Loader2 className="animate-spin text-[#4b58ff]" size={24} />
                ) : faceRegistered ? (
                  <CheckCircle className="text-green-400" size={24} />
                ) : (
                  <AlertCircle className="text-yellow-400" size={24} />
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {isLoadingStatus
                    ? "جاري التحقق..."
                    : faceRegistered
                    ? "الوجه مسجل"
                    : "الوجه غير مسجل"}
                </h3>
                <p className="text-sm text-muted">
                  {isLoadingStatus
                    ? "التحقق من حالة التسجيل..."
                    : faceRegistered
                    ? "يمكنك التحقق من هويتك"
                    : "يرجى تسجيل وجهك أولاً"}
                </p>
              </div>
            </div>
            <button
              onClick={checkFaceStatus}
              disabled={isLoadingStatus}
              className="btn btn-ghost"
            >
              <RefreshCw
                className={isLoadingStatus ? "animate-spin" : ""}
                size={18}
              />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card-glass p-4 border border-red-500/20 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-400 font-semibold mb-1">خطأ</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Camera Section */}
        <div className="card-glass p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="text-[#4b58ff]" size={24} />
            التقاط الصورة
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera View */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                {/* Always render video element, even when not active */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    display: isActive ? "block" : "none",
                    transform: "scaleX(-1)", // Mirror for better UX
                    opacity: videoReady ? 1 : 0.5, // Fade in when ready
                    minWidth: "100%",
                    minHeight: "100%",
                  }}
                  width="100%"
                  height="100%"
                  onLoadedMetadata={() => {
                    console.log("Video metadata loaded");
                    if (videoRef.current) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                  onLoadedData={() => {
                    console.log("Video data loaded");
                  }}
                  onCanPlay={() => {
                    console.log("Video can play");
                    if (
                      videoRef.current &&
                      videoRef.current.paused
                    ) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                  onPlaying={() => {
                    console.log("Video is playing");
                  }}
                  onPlay={() => {
                    console.log("Video play event");
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!isActive ? (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <Camera className="mx-auto mb-4 text-muted" size={48} />
                      <p className="text-muted mb-4">الكاميرا غير نشطة</p>
                      <button onClick={startCamera} className="btn btn-primary">
                        <Camera size={18} />
                        تشغيل الكاميرا
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!videoReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center">
                          <Loader2
                            className="animate-spin text-[#4b58ff] mx-auto mb-2"
                            size={32}
                          />
                          <p className="text-white text-sm">
                            جاري تحضير الكاميرا...
                          </p>
                        </div>
                      </div>
                    )}
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="text-center p-4">
                          <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
                          <p className="text-red-300 text-sm">{cameraError}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {isActive && (
                  <>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCapture}
                        disabled={!videoReady || isProcessing}
                        className="btn btn-primary flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            جاري المعالجة...
                          </>
                        ) : (
                          <>
                            <Camera size={18} />
                            التقاط
                          </>
                        )}
                      </button>
                      <button onClick={stopCamera} className="btn btn-ghost">
                        إيقاف
                      </button>
                    </div>
                    <button
                      onClick={handleTestCapture}
                      disabled={!videoReady}
                      className="btn btn-ghost text-xs"
                      title="Test if camera is receiving images"
                    >
                      <RefreshCw size={14} />
                      اختبار الكاميرا
                    </button>
                    {videoReady && (
                      <div className="text-xs text-green-400 flex items-center gap-2">
                        <CheckCircle size={14} />
                        الكاميرا جاهزة - الأبعاد: {videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* File Upload Alternative */}
              <div>
                <label className="block text-sm text-muted mb-2">
                  أو ارفع صورة
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "capture")}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm cursor-pointer hover:border-[#4b58ff]/50 transition-colors"
                />
              </div>
            </div>

            {/* Captured Image Preview */}
            <div className="space-y-4">
              {capturedImage ? (
                <>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleAnalyzeFace}
                      disabled={isProcessing}
                      className="btn btn-primary w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          جاري التحليل...
                        </>
                      ) : (
                        <>
                          <Smile size={18} />
                          تحليل المشاعر
                        </>
                      )}
                    </button>
                    {!faceRegistered ? (
                      <button
                        onClick={handleRegisterFace}
                        disabled={isProcessing}
                        className="btn btn-primary w-full"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            جاري التسجيل...
                          </>
                        ) : (
                          <>
                            <User size={18} />
                            تسجيل الوجه
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleVerifyFace}
                        disabled={isProcessing}
                        className="btn btn-primary w-full"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            جاري التحقق...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            التحقق
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setDetectionResult(null);
                        setVerificationResult(null);
                        setError(null);
                      }}
                      className="btn btn-ghost w-full"
                    >
                      <X size={18} />
                      مسح الصورة
                    </button>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center border border-white/10">
                  <p className="text-muted">لا توجد صورة مقتطعة</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {(detectionResult || verificationResult) && (
          <div className="card-glass p-6">
            <h3 className="text-xl font-bold text-white mb-4">النتائج</h3>

            {/* Verification Result */}
            {verificationResult && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">نتيجة التحقق</h4>
                  {verificationResult.verified ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={20} />
                      <span>مطابق</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <X size={20} />
                      <span>غير مطابق</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted mb-1">مستوى التشابه</p>
                    <p className="text-white font-bold">
                      {(verificationResult.similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">الثقة</p>
                    <p className="text-white font-bold">
                      {verificationResult.confidence.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {verificationResult.emotions && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-muted mb-2">المشاعر المكتشفة</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl ${getMoodColor(
                          verificationResult.emotions.mood
                        )}`}
                      >
                        {getMoodEmoji(verificationResult.emotions.mood)}
                      </span>
                      <span className="text-white">
                        {verificationResult.emotions.emotion} -{" "}
                        {verificationResult.emotions.mood}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detection/Analysis Result */}
            {detectionResult && detectionResult.success && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">تحليل الوجه</h4>
                    <span className="text-sm text-muted">
                      {detectionResult.face_count} وجه مكتشف
                    </span>
                  </div>

                  {detectionResult.faces.map((face, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted mb-1">الثقة</p>
                          <p className="text-white font-bold">
                            {(face.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        {face.emotions && (
                          <div>
                            <p className="text-sm text-muted mb-1">المزاج</p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xl ${getMoodColor(
                                  face.emotions.mood
                                )}`}
                              >
                                {getMoodEmoji(face.emotions.mood)}
                              </span>
                              <span className="text-white text-sm">
                                {face.emotions.mood}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {face.emotions && (
                        <div>
                          <p className="text-sm text-muted mb-2">
                            المشاعر المكتشفة
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(
                              face.emotions.all_emotions || {}
                            ).map(([emotion, confidence]) => (
                              <span
                                key={emotion}
                                className="px-3 py-1 rounded-lg bg-white/5 text-sm text-muted"
                              >
                                {emotion}: {(confidence * 100).toFixed(0)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detectionResult && !detectionResult.success && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={20} />
                  <span>
                    {detectionResult.error || "فشل اكتشاف الوجه"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Poster Image Upload (for registration) */}
        {!faceRegistered && capturedImage && (
          <div className="card-glass p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              صورة مرجعية (اختياري)
            </h3>
            <p className="text-sm text-muted mb-4">
              ارفع صورة مرجعية (مثل صورة شخصية) للتحقق من مطابقة الوجه
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "poster")}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm cursor-pointer hover:border-[#4b58ff]/50 transition-colors"
            />
            {posterImage && (
              <div className="mt-4">
                <img
                  src={posterImage}
                  alt="Poster"
                  className="max-w-xs rounded-lg border border-white/10"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
