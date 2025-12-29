/**
 * Tests for Face Recognition API utilities
 */
import {
  getFaceStatus,
  detectFaces,
  analyzeFace,
  registerFace,
  verifyFace,
} from '@/app/features/face-recognition/utils/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('Face Recognition API', () => {
  const mockToken = 'test-token';
  const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({
      state: { token: mockToken }
    }));
  });

  describe('getFaceStatus', () => {
    it('should fetch face status successfully', async () => {
      const mockResponse = {
        registered: true,
        registered_at: '2024-01-01T00:00:00',
        poster_verified: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getFaceStatus(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/face/status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should return default status on error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getFaceStatus(mockToken);

      expect(result).toEqual({
        registered: false,
        registered_at: null,
        poster_verified: false,
      });
    });
  });

  describe('detectFaces', () => {
    it('should detect faces successfully', async () => {
      const mockResponse = {
        success: true,
        faces: [{
          bbox: { x: 10, y: 10, width: 80, height: 80 },
          confidence: 0.95,
        }],
        face_count: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await detectFaces(`data:image/jpeg;base64,${mockImageBase64}`, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/face/detect`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: mockImageBase64,
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Face detection failed' }),
      });

      await expect(
        detectFaces(`data:image/jpeg;base64,${mockImageBase64}`, mockToken)
      ).rejects.toThrow('Face detection failed');
    });
  });

  describe('analyzeFace', () => {
    it('should analyze face successfully', async () => {
      const mockResponse = {
        face_detected: true,
        face_count: 1,
        emotions: {
          emotion: 'happy',
          mood: 'positive',
          confidence: 0.85,
          all_emotions: { happy: 0.85, sad: 0.05 },
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeFace(`data:image/jpeg;base64,${mockImageBase64}`, mockToken);

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Analysis failed' }),
      });

      await expect(
        analyzeFace(`data:image/jpeg;base64,${mockImageBase64}`, mockToken)
      ).rejects.toThrow('Analysis failed');
    });
  });

  describe('registerFace', () => {
    it('should register face successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Face registered successfully',
        poster_verified: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await registerFace(
        `data:image/jpeg;base64,${mockImageBase64}`,
        null,
        mockToken
      );

      expect(result).toEqual(mockResponse);
    });

    it('should register face with poster image', async () => {
      const mockResponse = {
        success: true,
        message: 'Face registered successfully',
        poster_verified: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await registerFace(
        `data:image/jpeg;base64,${mockImageBase64}`,
        `data:image/jpeg;base64,${mockImageBase64}`,
        mockToken
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyFace', () => {
    it('should verify face successfully', async () => {
      const mockResponse = {
        verified: true,
        similarity: 0.95,
        confidence: 0.90,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyFace(`data:image/jpeg;base64,${mockImageBase64}`, mockToken);

      expect(result).toEqual(mockResponse);
    });

    it('should handle verification failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Verification failed' }),
      });

      await expect(
        verifyFace(`data:image/jpeg;base64,${mockImageBase64}`, mockToken)
      ).rejects.toThrow('Verification failed');
    });
  });
});




