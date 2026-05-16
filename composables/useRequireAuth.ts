export const useRequireAuth = () => {
  const authStore = useAuthStore()

  const requireUserId = () => {
    const userId = authStore.userId
    if (!userId) throw new Error('Chưa đăng nhập')
    return userId
  }

  const requireUserIdInt = (): number => {
    return Number(requireUserId())
  }

  const requireNeonId = (): number => {
    const id = authStore.neonId
    if (!id) throw new Error('Chưa có Neon user ID')
    return id
  }

  const requireAuthOrRedirect = (): boolean => {
    if (!authStore.userId) {
      navigateTo('/login')
      return false
    }
    return true
  }

  const optionalUserId = (): string | null => {
    return authStore.userId
  }

  return {
    requireUserId,
    requireUserIdInt,
    requireNeonId,
    requireAuthOrRedirect,
    optionalUserId,
    isAuthenticated: computed(() => !!authStore.userId),
    userId: computed(() => authStore.userId),
    neonId: computed(() => authStore.neonId),
  }
}