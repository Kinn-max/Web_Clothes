import { useAuth } from "@/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // BỎ QUA AUTH PAGES
  if (to.path.startsWith("/auth") || to.path === "/403") {
    return;
  }

  const { token, user, fetchMe } = useAuth();

  // chưa login
  if (!token.value) {
    return navigateTo("/auth/login");
  }

  // chưa có user → /me
  if (!user.value) {
    try {
      await fetchMe();
    } catch (err) {
      return navigateTo("/auth/login");
    }
  }

  const role = user.value?.role;

  // redirect root
  if (to.path === "/") {
    return role === "admin"
      ? navigateTo("/admin/dashboard")
      : navigateTo("/home");
  }

  // check role theo meta
  if (to.meta.role && to.meta.role !== role) {
    return navigateTo("/403");
  }
});
