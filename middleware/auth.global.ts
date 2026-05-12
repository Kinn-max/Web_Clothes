export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  // Bỏ qua auth pages
  if (to.path.startsWith('/auth') || to.path === '/403') return

  //  Dùng authStore thay vì useAuth()
  const authStore = useAuthStore()

  // Chưa login → về trang login
  if (!authStore.token) {
    return navigateTo('/auth/login')
  }

  //  Không cần fetchMe nữa vì:
  // firebase.client.ts đã restore user qua onIdTokenChanged
  // authStore đã có đầy đủ token + user sau khi plugin chạy
  if (!authStore.user) {
    return navigateTo('/auth/login')
  }

  const role = authStore.role

  // Redirect từ root theo role
  if (to.path === '/') {
    return role === 'ADMIN'
      ? navigateTo('/admin/dashboard')
      : navigateTo('/home')
  }

  // Kiểm tra role theo route meta
  if (to.meta.role && to.meta.role !== role) {
    return navigateTo('/403')
  }
})