import { chatbotApi } from '@/lib/api/chatbot'

// Mock fetch
global.fetch = jest.fn()

describe('Chatbot API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({
      state: { token: 'mock-token' }
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should send message successfully', async () => {
    const mockResponse = {
      message: 'Test response',
      explanation: 'Test explanation'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await chatbotApi.sendMessage({
      message: 'Test question',
      language: 'ar',
    })

    expect(result.message).toBe('Test response')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/chatbot/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token',
        }),
      })
    )
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Server error' }),
    })

    const result = await chatbotApi.sendMessage({
      message: 'Test question',
    })

    // Should return fallback response
    expect(result.message).toContain('عذراً')
  })

  it('should return empty history when not authenticated', async () => {
    Storage.prototype.getItem = jest.fn(() => null)

    const history = await chatbotApi.getHistory()

    expect(history).toEqual([])
  })

  it('should fetch chat history successfully', async () => {
    const mockHistory = [
      {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: '2024-01-01T00:00:01Z',
      },
    ]

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistory,
    })

    const history = await chatbotApi.getHistory()

    expect(history).toHaveLength(2)
    expect(history[0].role).toBe('user')
    expect(history[1].role).toBe('assistant')
  })
})

