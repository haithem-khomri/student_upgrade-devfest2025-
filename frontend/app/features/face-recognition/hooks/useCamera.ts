"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseCameraOptions {
  autoStart?: boolean;
  onError?: (error: string) => void;
  onStreamReady?: (stream: MediaStream) => void;
}

interface UseCameraReturn {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  videoReady: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
  testCapture: () => boolean;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { autoStart = false, onError, onStreamReady } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<string>("idle");

  const stopCamera = useCallback((preserveStream?: MediaStream) => {
    // Get the current stream from ref FIRST (most up-to-date, not from state)
    const currentStream = streamRef.current;
    
    console.log("[CAMERA] Stopping camera...", { 
      preserveStream: !!preserveStream,
      currentStreamRef: !!currentStream,
      currentStreamActive: currentStream?.active,
      preserveStreamActive: preserveStream?.active,
    });
    
    // CRITICAL: If we're preserving a stream, and it's the current one, DON'T STOP IT
    if (preserveStream && currentStream === preserveStream) {
      console.log("[CAMERA] Preserving current stream, not stopping");
      return;
    }
    
    // Also check: if currentStream is active and we just got it, don't stop it
    if (currentStream && currentStream.active && !preserveStream) {
      // Check if this is a recently obtained stream (within last 2 seconds)
      // This prevents stopping a stream that was just obtained
      const streamId = (currentStream as any).__obtainedAt;
      if (streamId && Date.now() - streamId < 2000) {
        console.log("[CAMERA] Stream was just obtained, not stopping it");
        return;
      }
    }
    
    setCameraStatus("stopping");
    
    // Stop all tracks from current stream (unless it's the one we want to preserve)
    if (currentStream && currentStream !== preserveStream && currentStream.active) {
      currentStream.getTracks().forEach((track) => {
        if (track.readyState !== 'ended') {
          console.log(`[CAMERA] Stopping track: ${track.kind}`, {
            enabled: track.enabled,
            readyState: track.readyState,
            label: track.label,
          });
          track.stop();
          track.enabled = false;
        }
      });
      if (currentStream !== preserveStream) {
        streamRef.current = null;
        setStream(null);
      }
    }
    
    // Clear video element only if we're not preserving the stream
    if (videoRef.current && !preserveStream) {
      const video = videoRef.current;
      if (video.srcObject && video.srcObject !== preserveStream) {
        const mediaStream = video.srcObject as MediaStream;
        if (mediaStream.active) {
          mediaStream.getTracks().forEach((track) => {
            if (track.readyState !== 'ended') {
              track.stop();
              track.enabled = false;
            }
          });
        }
        video.srcObject = null;
      }
      if (!preserveStream) {
        video.pause();
        video.load(); // Reset video element
      }
    }

    if (!preserveStream) {
      setIsActive(false);
      setVideoReady(false);
      setCameraStatus("idle");
    }
    console.log("[CAMERA] Camera stopped");
  }, []); // No dependencies - use streamRef.current directly to avoid stale closures

  // Method 1: Standard getUserMedia with constraints
  const getMediaStreamMethod1 = async (): Promise<MediaStream | null> => {
    try {
      console.log("[CAMERA] Method 1: Trying standard getUserMedia with constraints");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: { ideal: "user" },
        },
      });
      console.log("[CAMERA] Method 1: Success");
      return stream;
    } catch (err: any) {
      console.warn("[CAMERA] Method 1 failed:", err.name, err.message);
      return null;
    }
  };

  // Method 2: getUserMedia with minimal constraints
  const getMediaStreamMethod2 = async (): Promise<MediaStream | null> => {
    try {
      console.log("[CAMERA] Method 2: Trying getUserMedia with minimal constraints");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log("[CAMERA] Method 2: Success");
      return stream;
    } catch (err: any) {
      console.warn("[CAMERA] Method 2 failed:", err.name, err.message);
      return null;
    }
  };

  // Method 3: getUserMedia with specific device
  const getMediaStreamMethod3 = async (): Promise<MediaStream | null> => {
    try {
      console.log("[CAMERA] Method 3: Trying with specific device");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      
      if (videoDevices.length === 0) {
        console.warn("[CAMERA] Method 3: No video devices found");
        return null;
      }

      // Try first available device
      const deviceId = videoDevices[0].deviceId;
      console.log(`[CAMERA] Method 3: Using device: ${videoDevices[0].label || deviceId}`);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
        },
      });
      console.log("[CAMERA] Method 3: Success");
      return stream;
    } catch (err: any) {
      console.warn("[CAMERA] Method 3 failed:", err.name, err.message);
      return null;
    }
  };

  // Method 4: Legacy getUserMedia (for older browsers)
  const getMediaStreamMethod4 = async (): Promise<MediaStream | null> => {
    try {
      console.log("[CAMERA] Method 4: Trying legacy getUserMedia");
      const getUserMedia =
        navigator.getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;

      if (!getUserMedia) {
        console.warn("[CAMERA] Method 4: Legacy getUserMedia not available");
        return null;
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(
          navigator,
          { video: true, audio: false },
          (stream: MediaStream) => {
            console.log("[CAMERA] Method 4: Success");
            resolve(stream);
          },
          (err: any) => {
            console.warn("[CAMERA] Method 4 failed:", err);
            reject(err);
          }
        );
      });
    } catch (err: any) {
      console.warn("[CAMERA] Method 4 failed:", err.name, err.message);
      return null;
    }
  };

  const startCamera = useCallback(async () => {
    console.log("[CAMERA] ===== Starting camera ===== ");
    setError(null);
    setCameraStatus("starting");
    
    // Get current stream BEFORE stopping (to preserve it if needed)
    const currentStreamToPreserve = streamRef.current;
    
    // First, ensure any existing camera is stopped (but preserve current if it's active)
    // Only stop if there's no active stream or if it's different
    if (!currentStreamToPreserve || !currentStreamToPreserve.active) {
      stopCamera();
    } else {
      console.log("[CAMERA] Current stream is active, preserving it");
    }

    // Wait a bit to ensure previous stream is fully released (only if we stopped one)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Try legacy method
      const legacyGetUserMedia =
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;

      if (!legacyGetUserMedia) {
        const errorMsg =
          "المتصفح لا يدعم الوصول إلى الكاميرا. يرجى استخدام Chrome أو Firefox أو Edge.";
        setError(errorMsg);
        setCameraStatus("error");
        onError?.(errorMsg);
        return;
      }
    }

    // Check if we're on HTTPS or localhost
    const isSecureContext =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0";

    if (!isSecureContext && navigator.mediaDevices) {
      const errorMsg =
        "يتطلب الوصول إلى الكاميرا HTTPS. يرجى استخدام https:// أو localhost";
      setError(errorMsg);
      setCameraStatus("error");
      onError?.(errorMsg);
      return;
    }

    try {
      // Try all methods in sequence
      let mediaStream: MediaStream | null = null;
      const methods = [
        getMediaStreamMethod1,
        getMediaStreamMethod2,
        getMediaStreamMethod3,
        getMediaStreamMethod4,
      ];

      for (let i = 0; i < methods.length; i++) {
        try {
          mediaStream = await methods[i]();
          if (mediaStream) {
            console.log(`[CAMERA] Successfully got stream using method ${i + 1}`);
            break;
          }
        } catch (err) {
          console.warn(`[CAMERA] Method ${i + 1} threw error:`, err);
          continue;
        }
        
        // Wait before trying next method
        if (i < methods.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (!mediaStream) {
        throw new Error("All camera access methods failed");
      }

      // Verify stream has video tracks
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error("Stream has no video tracks");
      }

      console.log("[CAMERA] Stream obtained successfully", {
        videoTracks: videoTracks.length,
        trackInfo: videoTracks.map((t) => ({
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
          settings: t.getSettings(),
        })),
      });

      // Store stream references FIRST before doing anything else
      // CRITICAL: Store in ref immediately to prevent stopCamera from stopping it
      // Mark stream with timestamp to prevent immediate stopping
      (mediaStream as any).__obtainedAt = Date.now();
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      setCameraStatus("stream_obtained");

      console.log("[CAMERA] Stream stored in ref and state", {
        streamRef: !!streamRef.current,
        streamState: !!mediaStream,
        streamActive: mediaStream.active,
        streamId: (mediaStream as any).__obtainedAt,
      });

      // Wait a moment to ensure video element is rendered and has dimensions
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Notify callback AFTER waiting and storing stream to prevent it from being stopped
      // Pass the stream as preserveStream to prevent stopCamera from stopping it
      onStreamReady?.(mediaStream);
      
      // IMPORTANT: Don't call stopCamera here - we just got the stream!

      // Attach to video element
      if (!videoRef.current) {
        console.error("[CAMERA] Video ref is null, waiting for element...");
        // Try waiting a bit more
        let attempts = 0;
        while (!videoRef.current && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }
      }

      if (videoRef.current) {
        const video = videoRef.current;
        console.log("[CAMERA] Video element found, checking dimensions before attaching");
        
        // Ensure video element is visible and has proper dimensions
        const parentElement = video.parentElement;
        if (parentElement) {
          const parentRect = parentElement.getBoundingClientRect();
          console.log("[CAMERA] Parent element dimensions:", {
            width: parentRect.width,
            height: parentRect.height,
          });
          
          // Force video to be visible and have proper dimensions
          video.style.display = 'block';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.minWidth = '100%';
          video.style.minHeight = '100%';
        }
        
        // Clear any existing stream first (only if it's different)
        if (video.srcObject && video.srcObject !== mediaStream) {
          const oldStream = video.srcObject as MediaStream;
          console.log("[CAMERA] Clearing old stream from video element");
          oldStream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') {
              track.stop();
            }
          });
          video.srcObject = null;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        
        console.log("[CAMERA] Attaching stream to video element");
        
        // Get dimensions from stream tracks BEFORE attaching
        const videoTracks = mediaStream.getVideoTracks();
        let streamWidth: number | undefined;
        let streamHeight: number | undefined;
        
        if (videoTracks.length > 0) {
          const track = videoTracks[0];
          const settings = track.getSettings();
          const capabilities = track.getCapabilities();
          
          console.log("[CAMERA] Stream track info before attach:", {
            settings: settings,
            capabilities: capabilities,
          });
          
          // Try to get dimensions from settings first (most accurate)
          if (settings.width && settings.height && settings.width > 2 && settings.height > 2) {
            streamWidth = settings.width;
            streamHeight = settings.height;
            console.log("[CAMERA] Got dimensions from settings:", { width: streamWidth, height: streamHeight });
          } else {
            // If settings don't have dimensions, use capabilities or defaults
            if (capabilities.width && capabilities.height) {
              // Capabilities are usually objects like {min: 320, max: 1920, ideal: 640}
              const widthObj = capabilities.width as any;
              const heightObj = capabilities.height as any;
              
              if (typeof widthObj === 'object' && widthObj !== null) {
                streamWidth = widthObj.ideal || widthObj.max || widthObj.min || 640;
              } else if (typeof widthObj === 'number') {
                streamWidth = widthObj;
              } else {
                streamWidth = 640;
              }
              
              if (typeof heightObj === 'object' && heightObj !== null) {
                streamHeight = heightObj.ideal || heightObj.max || heightObj.min || 480;
              } else if (typeof heightObj === 'number') {
                streamHeight = heightObj;
              } else {
                streamHeight = 480;
              }
              
              console.log("[CAMERA] Got dimensions from capabilities:", { 
                width: streamWidth, 
                height: streamHeight,
                capabilitiesWidth: capabilities.width,
                capabilitiesHeight: capabilities.height,
              });
            } else {
              // Fallback to default dimensions
              streamWidth = 640;
              streamHeight = 480;
              console.log("[CAMERA] Using default dimensions (no capabilities):", { width: streamWidth, height: streamHeight });
            }
          }
          
          // Ensure we have valid dimensions
          if (!streamWidth || !streamHeight || streamWidth <= 2 || streamHeight <= 2) {
            console.warn("[CAMERA] Invalid dimensions from stream, using defaults");
            streamWidth = 640;
            streamHeight = 480;
          }
        }
        
        // Set video dimensions explicitly BEFORE attaching stream
        // This ensures the video element has correct dimensions from the start
        if (streamWidth && streamHeight && streamWidth > 2 && streamHeight > 2) {
          video.width = streamWidth;
          video.height = streamHeight;
          video.style.width = `${streamWidth}px`;
          video.style.height = `${streamHeight}px`;
          video.style.minWidth = `${streamWidth}px`;
          video.style.minHeight = `${streamHeight}px`;
          video.style.maxWidth = `${streamWidth}px`;
          video.style.maxHeight = `${streamHeight}px`;
          console.log("[CAMERA] Set video dimensions BEFORE attaching stream:", { 
            width: streamWidth, 
            height: streamHeight,
            videoWidth: video.width,
            videoHeight: video.height,
          });
        }
        
        // Attach stream to video element AFTER setting dimensions
        if (video.srcObject !== mediaStream) {
          video.srcObject = mediaStream;
          console.log("[CAMERA] Stream attached to video element");
        }
        
        // Force video to update dimensions after stream attachment
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Double-check dimensions after attachment
        if (video.videoWidth > 2 && video.videoHeight > 2) {
          console.log("[CAMERA] Video has valid dimensions after attachment:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
          });
          // Update to actual video dimensions if different
          if (video.videoWidth !== streamWidth || video.videoHeight !== streamHeight) {
            video.width = video.videoWidth;
            video.height = video.videoHeight;
            console.log("[CAMERA] Updated video dimensions to actual:", {
              width: video.videoWidth,
              height: video.videoHeight,
            });
          }
          // Mark as ready since we have valid dimensions
          setVideoReady(true);
          setCameraStatus("ready");
        } else {
          console.warn("[CAMERA] Video dimensions still invalid after attachment, keeping set dimensions:", {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            setWidth: streamWidth,
            setHeight: streamHeight,
          });
        }
        
        // Wait a bit for the stream to attach
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        // Try to play (don't call load() as it resets the video)
        try {
          if (video.paused) {
            await video.play();
            console.log("[CAMERA] Video playing");
          }
        } catch (err) {
          console.warn("[CAMERA] Initial play failed, will retry:", err);
          // Retry play after a short delay
          setTimeout(() => {
            if (video.paused && video.srcObject) {
              video.play().catch(console.error);
            }
          }, 300);
        }

        // Set up event listeners with better logging
        const handleLoadedMetadata = () => {
          const width = video.videoWidth;
          const height = video.videoHeight;
          const readyState = video.readyState;
          
          console.log("[CAMERA] Video metadata loaded", {
            width,
            height,
            readyState,
            duration: video.duration,
            clientWidth: video.clientWidth,
            clientHeight: video.clientHeight,
            offsetWidth: video.offsetWidth,
            offsetHeight: video.offsetHeight,
            srcObject: !!video.srcObject,
            srcObjectActive: video.srcObject ? (video.srcObject as MediaStream).active : false,
          });
          
          // Get actual track settings to see what the camera is providing
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            const tracks = stream.getVideoTracks();
            tracks.forEach(track => {
              const settings = track.getSettings();
              const capabilities = track.getCapabilities();
              const constraints = track.getConstraints();
              console.log("[CAMERA] Video track info:", {
                settings: settings,
                width: settings.width,
                height: settings.height,
                frameRate: settings.frameRate,
                facingMode: settings.facingMode,
                capabilities: capabilities,
                constraints: constraints,
                enabled: track.enabled,
                readyState: track.readyState,
                muted: track.muted,
              });
              
              // If settings don't have dimensions, try to get them from capabilities
              if (!settings.width || !settings.height) {
                console.log("[CAMERA] Settings missing dimensions, checking capabilities");
                if (capabilities.width && capabilities.height) {
                  console.log("[CAMERA] Capabilities have dimensions:", {
                    width: capabilities.width,
                    height: capabilities.height,
                  });
                }
              }
            });
          }
          
          // Also check if we can get dimensions from the stream itself
          if (mediaStream && mediaStream.active) {
            const tracks = mediaStream.getVideoTracks();
            tracks.forEach(track => {
              const settings = track.getSettings();
              console.log("[CAMERA] Direct stream track settings:", settings);
            });
          }
          
          // ALWAYS get dimensions from stream track if available (more reliable than video.videoWidth/Height)
          let finalWidth = width;
          let finalHeight = height;
          
          // Priority: Use stream track settings (most reliable)
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            const tracks = stream.getVideoTracks();
            if (tracks.length > 0) {
              const track = tracks[0];
              const settings = track.getSettings();
              if (settings.width && settings.height && settings.width > 2 && settings.height > 2) {
                finalWidth = settings.width;
                finalHeight = settings.height;
                console.log("[CAMERA] Using dimensions from stream track (reliable source):", { 
                  width: finalWidth, 
                  height: finalHeight 
                });
                // ALWAYS update video element dimensions from stream
                video.width = finalWidth;
                video.height = finalHeight;
                video.style.width = `${finalWidth}px`;
                video.style.height = `${finalHeight}px`;
              }
            }
          }
          
          // Fallback: If stream doesn't have dimensions, use video dimensions if valid
          if ((finalWidth <= 2 || finalHeight <= 2) && width > 2 && height > 2) {
            finalWidth = width;
            finalHeight = height;
            console.log("[CAMERA] Using video element dimensions:", { width: finalWidth, height: finalHeight });
          }
          
          // Check if dimensions are valid (greater than 2x2)
          if (finalWidth > 2 && finalHeight > 2) {
            console.log("[CAMERA] Video has valid dimensions, setting ready", { width: finalWidth, height: finalHeight });
            setVideoReady(true);
            setCameraStatus("ready");
            if (video.paused) {
              video.play().catch((err) => {
                console.error("[CAMERA] Error playing video:", err);
              });
            }
          } else {
            console.warn("[CAMERA] Video has invalid dimensions, will retry", { width: finalWidth, height: finalHeight });
            // Wait and retry - get dimensions from stream again
            setTimeout(() => {
              let newWidth = video.videoWidth;
              let newHeight = video.videoHeight;
              
              // Always try to get from stream first
              if (video.srcObject) {
                const stream = video.srcObject as MediaStream;
                const tracks = stream.getVideoTracks();
                if (tracks.length > 0) {
                  const settings = tracks[0].getSettings();
                  if (settings.width && settings.height && settings.width > 2 && settings.height > 2) {
                    newWidth = settings.width;
                    newHeight = settings.height;
                    video.width = newWidth;
                    video.height = newHeight;
                    video.style.width = `${newWidth}px`;
                    video.style.height = `${newHeight}px`;
                    console.log("[CAMERA] Retry: Got dimensions from stream:", { width: newWidth, height: newHeight });
                  }
                }
              }
              
              console.log("[CAMERA] Retry check dimensions:", { width: newWidth, height: newHeight });
              
              if (newWidth > 2 && newHeight > 2) {
                setVideoReady(true);
                setCameraStatus("ready");
              } else {
                console.error("[CAMERA] Video still has invalid dimensions after retry");
              }
            }, 1000);
          }
        };

        const handleLoadedData = () => {
          console.log("[CAMERA] Video data loaded");
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
            setCameraStatus("ready");
          }
        };

        const handleCanPlay = () => {
          console.log("[CAMERA] Video can play");
          if (video.paused) {
            video.play().catch((err) => {
              console.error("[CAMERA] Error playing video:", err);
            });
          }
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setVideoReady(true);
            setCameraStatus("ready");
          }
        };

        const handlePlaying = () => {
          console.log("[CAMERA] Video is now playing", {
            width: video.videoWidth,
            height: video.videoHeight,
            paused: video.paused,
          });
          setVideoReady(true);
          setCameraStatus("playing");
        };

        const handlePlay = () => {
          console.log("[CAMERA] Video play event fired");
        };

        const handleError = (e: Event) => {
          console.error("[CAMERA] Video error event:", e);
          const errorMsg = "خطأ في تشغيل الفيديو";
          setError(errorMsg);
          setCameraStatus("error");
          onError?.(errorMsg);
        };

        // Add all event listeners
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("play", handlePlay);
        video.addEventListener("error", handleError);

        // Try to play immediately
        try {
          await video.play();
          console.log("[CAMERA] Video play() succeeded immediately");
        } catch (playError: any) {
          console.warn("[CAMERA] Video play() failed, will retry:", playError);
        }

        // Fallback: check after delays with dimension validation
        const checkIntervals = [500, 1000, 2000, 3000];
        checkIntervals.forEach((delay) => {
          setTimeout(() => {
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            // Try to get dimensions from stream if video dimensions are invalid
            if ((width <= 2 || height <= 2) && video.srcObject) {
              const stream = video.srcObject as MediaStream;
              const tracks = stream.getVideoTracks();
              if (tracks.length > 0) {
                const settings = tracks[0].getSettings();
                if (settings.width && settings.height) {
                  width = settings.width;
                  height = settings.height;
                  video.width = width;
                  video.height = height;
                  console.log(`[CAMERA] Using stream dimensions at ${delay}ms:`, { width, height });
                }
              }
            }
            
            // Check for valid dimensions (greater than 2x2)
            if (width > 2 && height > 2) {
              console.log(`[CAMERA] Video ready after ${delay}ms delay`, {
                width,
                height,
              });
              setVideoReady(true);
              setCameraStatus("ready");
              if (video.paused) {
                video.play().catch(console.error);
              }
            } else {
              console.warn(`[CAMERA] Video still not ready after ${delay}ms`, {
                width,
                height,
                readyState: video.readyState,
                paused: video.paused,
                srcObject: !!video.srcObject,
                clientWidth: video.clientWidth,
                clientHeight: video.clientHeight,
              });
              
              // Don't reload - that stops the stream. Just keep trying
            }
          }, delay);
        });

        // Final check after 5 seconds
        setTimeout(() => {
          const width = video.videoWidth;
          const height = video.videoHeight;
          
          if (width <= 2 || height <= 2) {
            console.error("[CAMERA] Video failed to initialize after 5 seconds", {
              width,
              height,
              readyState: video.readyState,
              srcObject: !!video.srcObject,
            });
            
            // Try one more time to reload
            if (video.srcObject) {
              console.log("[CAMERA] Attempting final reload");
              video.load();
              setTimeout(() => {
                if (video.videoWidth <= 2 || video.videoHeight <= 2) {
                  const errorMsg = "الكاميرا لا تعمل بشكل صحيح. يرجى المحاولة مرة أخرى.";
                  setError(errorMsg);
                  setCameraStatus("error");
                  onError?.(errorMsg);
                }
              }, 1000);
            } else {
              const errorMsg = "الكاميرا لا تعمل بشكل صحيح. يرجى المحاولة مرة أخرى.";
              setError(errorMsg);
              setCameraStatus("error");
              onError?.(errorMsg);
            }
          }
        }, 5000);
      } else {
        console.error("[CAMERA] Video ref is null");
        const errorMsg = "خطأ في تهيئة عنصر الفيديو";
        setError(errorMsg);
        setCameraStatus("error");
        onError?.(errorMsg);
      }
    } catch (error: any) {
      console.error("[CAMERA] Error accessing camera:", error);

      let errorMsg = "فشل الوصول إلى الكاميرا.";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMsg =
          "تم رفض الوصول إلى الكاميرا. يرجى السماح بالوصول في إعدادات المتصفح.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMsg =
          "لم يتم العثور على كاميرا. يرجى التأكد من وجود كاميرا متصلة.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError" ||
        error.message?.includes("in use")
      ) {
        errorMsg = "الكاميرا مستخدمة حالياً من تطبيق آخر. يرجى إغلاق التطبيقات الأخرى التي تستخدم الكاميرا.";
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        errorMsg = "الكاميرا لا تدعم المتطلبات المطلوبة.";
      } else if (error.name === "SecurityError") {
        errorMsg = "خطأ أمني. يرجى التأكد من استخدام HTTPS أو localhost.";
      } else {
        errorMsg = `خطأ في الوصول إلى الكاميرا: ${error.message || error.name}`;
      }

      setError(errorMsg);
      setCameraStatus("error");
      onError?.(errorMsg);
    }
  }, [stopCamera, onError, onStreamReady]);

  const captureImage = useCallback((): string | null => {
    console.log("[CAMERA] Attempting to capture image...");
    
    if (!videoRef.current || !canvasRef.current) {
      console.warn("[CAMERA] Video or canvas ref not available");
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    console.log("[CAMERA] Video state:", {
      readyState: video.readyState,
      width: video.videoWidth,
      height: video.videoHeight,
      paused: video.paused,
      srcObject: !!video.srcObject,
    });

    // Wait for video to be ready
    if (video.readyState < 2) {
      console.warn("[CAMERA] Video not ready (readyState < 2)");
      return null;
    }

    // Check if video has valid dimensions (greater than 2x2)
    if (
      !video.videoWidth ||
      !video.videoHeight ||
      video.videoWidth <= 2 ||
      video.videoHeight <= 2
    ) {
      console.warn("[CAMERA] Video dimensions not valid", {
        width: video.videoWidth,
        height: video.videoHeight,
        readyState: video.readyState,
        clientWidth: video.clientWidth,
        clientHeight: video.clientHeight,
      });
      return null;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      console.error("[CAMERA] Could not get canvas context");
      return null;
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log("[CAMERA] Drawing to canvas", {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.92);

      if (!imageData || imageData === "data:,") {
        console.error("[CAMERA] Failed to capture image data");
        return null;
      }

      console.log("[CAMERA] Image captured successfully", {
        dataLength: imageData.length,
        preview: imageData.substring(0, 50) + "...",
      });

      return imageData;
    } catch (error: any) {
      console.error("[CAMERA] Error capturing image:", error);
      return null;
    }
  }, []);

  const testCapture = useCallback((): boolean => {
    const result = captureImage();
    if (result) {
      console.log("[CAMERA] Test capture successful");
      return true;
    } else {
      console.warn("[CAMERA] Test capture failed");
      return false;
    }
  }, [captureImage]);

  // Initialize camera on mount if autoStart is true
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        startCamera();
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoStart, startCamera]);

  // Cleanup on unmount - use ref directly to avoid dependency issues
  useEffect(() => {
    return () => {
      // Get latest stream from ref before stopping (avoid stale closures)
      const currentStream = streamRef.current;
      if (currentStream && currentStream.active) {
        console.log("[CAMERA] Cleanup: Stopping stream on unmount");
        currentStream.getTracks().forEach(track => {
          if (track.readyState !== 'ended') {
            track.stop();
            track.enabled = false;
          }
        });
      }
      // Also cleanup video element
      if (videoRef.current) {
        const video = videoRef.current;
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            if (track.readyState !== 'ended') {
              track.stop();
            }
          });
          video.srcObject = null;
        }
      }
    };
  }, []); // Empty deps - cleanup only runs on unmount

  return {
    stream,
    videoRef,
    canvasRef,
    isActive,
    videoReady,
    error,
    startCamera,
    stopCamera,
    captureImage,
    testCapture,
  };
}
