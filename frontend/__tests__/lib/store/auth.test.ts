import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/lib/store/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset store state
    useAuthStore.getState().logout()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.token).toBe(null)
  })

  it('should login successfully with demo account', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('demo@student.ai', 'demo123')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeTruthy()
    expect(result.current.user?.email).toBe('demo@student.ai')
    expect(result.current.token).toBeTruthy()
  })

  it('should login with any email for demo purposes', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeTruthy()
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First login
    await act(async () => {
      await result.current.login('demo@student.ai', 'demo123')
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.token).toBe(null)
  })

  it('should persist auth state in localStorage', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('demo@student.ai', 'demo123')
    })

    // Check localStorage
    const stored = localStorage.getItem('auth-storage')
    expect(stored).toBeTruthy()
    
    const parsed = JSON.parse(stored!)
    expect(parsed.state.isAuthenticated).toBe(true)
    expect(parsed.state.user).toBeTruthy()
  })
})

