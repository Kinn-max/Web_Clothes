// stores/auth.ts
import { defineStore } from 'pinia'
import type { AuthUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const userId = computed(() => user.value?.userId ?? null)
  const role = computed(() => user.value?.role ?? null)
  const fullName = computed(() => user.value?.full_name ?? null)
  const email = computed(() => user.value?.email ?? null)

  function setAuth(authUser: AuthUser, authToken: string) {
    user.value = authUser
    token.value = authToken
    localStorage.setItem('token', authToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isAuthenticated,
    userId,    
    role,
    fullName,
    email,
    setAuth,
    clearAuth,
  }
})