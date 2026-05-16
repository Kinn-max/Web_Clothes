export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (to.path.startsWith('/auth') || to.path === '/403') return

  const PUBLIC_ROUTES = [
    '/home',
    '/about',
    '/contact',
    '/shop',
  ]

  const isPublic =
    PUBLIC_ROUTES.includes(to.path) ||
    to.path.startsWith('/shop/') ||
    to.path.startsWith('/categories/')

  const authStore = useAuthStore()

  if (!authStore.token || !authStore.user) {
    if (isPublic) return
    return navigateTo('/auth/login')
  }

  const role = authStore.role

  if (to.path === '/') {
    return role === 'ADMIN'
      ? navigateTo('/admin/dashboard')
      : navigateTo('/home')
  }

  if (to.path.startsWith('/admin') && role !== 'ADMIN') {
    return navigateTo('/403')
  }

  if (to.meta.role && to.meta.role !== role) {
    return navigateTo('/403')
  }
})