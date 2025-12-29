/**
 * Tests for useCamera hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from '@/app/features/face-recognition/hooks/useCamera';

// Mock MediaDevices API
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

// Setup global mocks
beforeAll(() => {
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: mockGetUserMedia,
      enumerateDevices: mockEnumerateDevices,
    },
  });

  Object.defineProperty(window, 'location', {
    value: {
      protocol: 'http:',
      hostname: 'localhost',
    },
    writable: true,
  });
});

describe('useCamera Hook', () => {
  let mockStream: MediaStream;
  let mockVideoTrack: MediaStreamTrack;
  let mockTracks: MediaStreamTrack[];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create mock track with proper methods
    mockVideoTrack = {
      stop: jest.fn(),
      enabled: true,
      kind: 'video',
      label: 'USB2.0 HD UVC WebCam',
      readyState: 'live',
      muted: false,
      getSettings: jest.fn(() => ({
        width: 640,
        height: 480,
        frameRate: 30,
        facingMode: 'user',
      })),
      getCapabilities: jest.fn(() => ({
        width: { min: 320, max: 1920, ideal: 640 },
        height: { min: 240, max: 1080, ideal: 480 },
        frameRate: { min: 15, max: 60, ideal: 30 },
      })),
      getConstraints: jest.fn(() => ({})),
      applyConstraints: jest.fn(() => Promise.resolve()),
      clone: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(() => true),
    } as unknown as MediaStreamTrack;

    mockTracks = [mockVideoTrack];

    // Create mock stream
    mockStream = {
      active: true,
      id: 'mock-stream-id',
      getTracks: jest.fn(() => mockTracks),
      getVideoTracks: jest.fn(() => mockTracks),
      getAudioTracks: jest.fn(() => []),
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
      clone: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(() => true),
    } as unknown as MediaStream;

    // Mock getUserMedia
    mockGetUserMedia.mockResolvedValue(mockStream);

    // Mock enumerateDevices
    mockEnumerateDevices.mockResolvedValue([
      {
        deviceId: 'device1',
        kind: 'videoinput',
        label: 'USB2.0 HD UVC WebCam',
        groupId: 'group1',
      },
    ]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useCamera());

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.videoReady).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.videoRef).toBeDefined();
      expect(result.current.canvasRef).toBeDefined();
    });

    it('should not auto-start when autoStart is false', async () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.isActive).toBe(false);
      expect(mockGetUserMedia).not.toHaveBeenCalled();
    });
  });

  describe('Camera Start', () => {
    it('should start camera successfully', async () => {
      const onStreamReady = jest.fn();
      const { result } = renderHook(() =>
        useCamera({
          autoStart: false,
          onStreamReady,
        })
      );

      // Create mock video and canvas elements
      const mockVideo = {
        width: 640,
        height: 480,
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4,
        paused: true,
        srcObject: null,
        clientWidth: 640,
        clientHeight: 480,
        offsetWidth: 640,
        offsetHeight: 480,
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        load: jest.fn(),
        addEventListener: jest.fn((event: string, handler: any) => {
          // Simulate video events immediately for testing
          if (event === 'loadedmetadata' && handler) {
            setTimeout(() => handler(), 10);
          }
          if (event === 'loadeddata' && handler) {
            setTimeout(() => handler(), 20);
          }
          if (event === 'canplay' && handler) {
            setTimeout(() => handler(), 30);
          }
          if (event === 'playing' && handler) {
            setTimeout(() => handler(), 40);
          }
        }),
        removeEventListener: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({
          width: 640,
          height: 480,
          top: 0,
          left: 0,
          bottom: 480,
          right: 640,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        })),
        parentElement: {
          getBoundingClientRect: jest.fn(() => ({
            width: 640,
            height: 480,
            top: 0,
            left: 0,
            bottom: 480,
            right: 640,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          })),
        },
        style: {
          display: '',
          width: '',
          height: '',
          minWidth: '',
          minHeight: '',
          maxWidth: '',
          maxHeight: '',
        },
      } as any;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: jest.fn(),
        })),
        toDataURL: jest.fn(() => 'data:image/jpeg;base64,test'),
      } as any;

      // Set refs manually
      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = mockCanvas;

      await act(async () => {
        const startPromise = result.current.startCamera();
        // Advance timers to simulate video events
        jest.advanceTimersByTime(500);
        await startPromise;
      });

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
        expect(result.current.isActive).toBe(true);
        expect(result.current.stream).not.toBeNull();
      }, { timeout: 3000 });
    });

    it('should handle getUserMedia errors gracefully', async () => {
      const onError = jest.fn();
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useCamera({
          autoStart: false,
          onError,
        })
      );

      await act(async () => {
        await result.current.startCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('رفض الوصول');
      expect(onError).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });

    it('should try multiple methods if first fails', async () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      // First method fails, second succeeds
      mockGetUserMedia
        .mockRejectedValueOnce(new Error('Method 1 failed'))
        .mockResolvedValueOnce(mockStream);

      const mockVideo = {
        width: 640,
        height: 480,
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4,
        paused: true,
        srcObject: null,
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        load: jest.fn(),
        addEventListener: jest.fn((event: string, handler: any) => {
          if (event === 'loadedmetadata' && handler) setTimeout(() => handler(), 10);
          if (event === 'loadeddata' && handler) setTimeout(() => handler(), 20);
          if (event === 'canplay' && handler) setTimeout(() => handler(), 30);
          if (event === 'playing' && handler) setTimeout(() => handler(), 40);
        }),
        removeEventListener: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({
          width: 640,
          height: 480,
          top: 0,
          left: 0,
          bottom: 480,
          right: 640,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        })),
        parentElement: {
          getBoundingClientRect: jest.fn(() => ({
            width: 640,
            height: 480,
            top: 0,
            left: 0,
            bottom: 480,
            right: 640,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          })),
        },
        style: {
          display: '',
          width: '',
          height: '',
          minWidth: '',
          minHeight: '',
          maxWidth: '',
          maxHeight: '',
        },
      } as any;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: jest.fn(),
        })),
      } as any;

      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = mockCanvas;

      await act(async () => {
        await result.current.startCamera();
        jest.advanceTimersByTime(2000);
      });

      // Should have tried multiple times
      expect(mockGetUserMedia.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Camera Stop', () => {
    it('should stop camera and clean up resources', async () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        width: 640,
        height: 480,
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4,
        paused: false,
        srcObject: mockStream,
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        load: jest.fn(),
        addEventListener: jest.fn((event: string, handler: any) => {
          if (event === 'loadedmetadata' && handler) setTimeout(() => handler(), 10);
          if (event === 'loadeddata' && handler) setTimeout(() => handler(), 20);
          if (event === 'canplay' && handler) setTimeout(() => handler(), 30);
          if (event === 'playing' && handler) setTimeout(() => handler(), 40);
        }),
        removeEventListener: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({
          width: 640,
          height: 480,
          top: 0,
          left: 0,
          bottom: 480,
          right: 640,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        })),
        parentElement: {
          getBoundingClientRect: jest.fn(() => ({
            width: 640,
            height: 480,
            top: 0,
            left: 0,
            bottom: 480,
            right: 640,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          })),
        },
        style: {
          display: '',
          width: '',
          height: '',
          minWidth: '',
          minHeight: '',
          maxWidth: '',
          maxHeight: '',
        },
      } as any;

      (result.current.videoRef as any).current = mockVideo;

      // Start camera first
      await act(async () => {
        await result.current.startCamera();
        jest.advanceTimersByTime(500);
      });

      expect(result.current.isActive).toBe(true);

      // Stop camera
      act(() => {
        result.current.stopCamera();
      });

      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
      expect(result.current.videoReady).toBe(false);
    });
  });

  describe('Image Capture', () => {
    it('should capture image successfully when video is ready', () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4,
        paused: false,
        srcObject: mockStream,
      } as any;

      const mockContext = {
        drawImage: jest.fn(),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => mockContext),
        toDataURL: jest.fn(() => 'data:image/jpeg;base64,test'),
      } as any;

      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = mockCanvas;

      const capturedImage = result.current.captureImage();

      expect(capturedImage).toBeTruthy();
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockCanvas.toDataURL).toHaveBeenCalled();
    });

    it('should return null if video dimensions are invalid', () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        videoWidth: 2,
        videoHeight: 2,
        readyState: 4,
      } as any;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: jest.fn(),
        })),
      } as any;

      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = mockCanvas;

      const capturedImage = result.current.captureImage();

      expect(capturedImage).toBeNull();
    });

    it('should return null if video is not ready', () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480,
        readyState: 1, // Not ready
      } as any;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          drawImage: jest.fn(),
        })),
      } as any;

      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = mockCanvas;

      const capturedImage = result.current.captureImage();

      expect(capturedImage).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle NotAllowedError', async () => {
      const onError = jest.fn();
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useCamera({
          autoStart: false,
          onError,
        })
      );

      await act(async () => {
        await result.current.startCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('رفض الوصول');
      expect(onError).toHaveBeenCalled();
    });

    it('should handle NotFoundError', async () => {
      const onError = jest.fn();
      const error = new DOMException('No camera found', 'NotFoundError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useCamera({
          autoStart: false,
          onError,
        })
      );

      await act(async () => {
        await result.current.startCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('لم يتم العثور على كاميرا');
      expect(onError).toHaveBeenCalled();
    });

    it('should handle NotReadableError', async () => {
      const onError = jest.fn();
      const error = new DOMException('Camera in use', 'NotReadableError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useCamera({
          autoStart: false,
          onError,
        })
      );

      await act(async () => {
        await result.current.startCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('مستخدمة حالياً');
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        width: 640,
        height: 480,
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4,
        srcObject: mockStream,
        pause: jest.fn(),
        load: jest.fn(),
        addEventListener: jest.fn((event: string, handler: any) => {
          if (event === 'loadedmetadata' && handler) setTimeout(() => handler(), 10);
          if (event === 'loadeddata' && handler) setTimeout(() => handler(), 20);
          if (event === 'canplay' && handler) setTimeout(() => handler(), 30);
          if (event === 'playing' && handler) setTimeout(() => handler(), 40);
        }),
        removeEventListener: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({
          width: 640,
          height: 480,
          top: 0,
          left: 0,
          bottom: 480,
          right: 640,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        })),
        parentElement: {
          getBoundingClientRect: jest.fn(() => ({
            width: 640,
            height: 480,
            top: 0,
            left: 0,
            bottom: 480,
            right: 640,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          })),
        },
        style: {
          display: '',
          width: '',
          height: '',
          minWidth: '',
          minHeight: '',
          maxWidth: '',
          maxHeight: '',
        },
      } as any;

      (result.current.videoRef as any).current = mockVideo;

      await act(async () => {
        await result.current.startCamera();
        jest.advanceTimersByTime(500);
      });

      expect(result.current.isActive).toBe(true);

      unmount();

      expect(mockVideoTrack.stop).toHaveBeenCalled();
    });
  });

  describe('Test Capture', () => {
    it('should return true on successful capture', () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4,
      } as any;

      const mockContext = {
        drawImage: jest.fn(),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn(() => mockContext),
        toDataURL: jest.fn(() => 'data:image/jpeg;base64,test'),
      } as any;

      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = mockCanvas;

      const success = result.current.testCapture();

      expect(success).toBe(true);
    });

    it('should return false on failed capture', () => {
      const { result } = renderHook(() => useCamera({ autoStart: false }));

      const mockVideo = {
        videoWidth: 2,
        videoHeight: 2,
      } as any;

      (result.current.videoRef as any).current = mockVideo;
      (result.current.canvasRef as any).current = null;

      const success = result.current.testCapture();

      expect(success).toBe(false);
    });
  });
});
