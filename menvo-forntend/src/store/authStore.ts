import { create } from 'zustand'
import type { AuthUser } from '../types/auth'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setAuth: (accessToken: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStoredAccessToken(),
  user: null,
  setAuth: (accessToken, user) => {
    localStorage.setItem('accessToken', accessToken)
    set({ accessToken, user })
  },
  clearAuth: () => {
    localStorage.removeItem('accessToken')
    set({ accessToken: null, user: null })
  },
}))

function getStoredAccessToken() {
  return localStorage.getItem('accessToken')
}
