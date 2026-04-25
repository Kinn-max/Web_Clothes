<script setup lang="ts">
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  ClipboardList,
  ChevronDown,
} from "lucide-vue-next";
import { onClickOutside } from "@vueuse/core";

const { user, isAuthenticated, logout } = useAuth();
const { cartCount } = useCart();
const route = useRoute();

const dropdownRef = ref(null);
const isMenuOpen = ref(false);
const isUserDropdownOpen = ref(false);

const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value);
const toggleUserDropdown = () =>
  (isUserDropdownOpen.value = !isUserDropdownOpen.value);

const displayName = computed(() => {
  return user.value?.full_name || user.value?.email || "User";
});

const closeDropdowns = () => {
  isUserDropdownOpen.value = false;
};

onClickOutside(dropdownRef, () => {
  isUserDropdownOpen.value = false;
});

const isActive = (path: string) => {
  if (path === '/home') return route.path === '/home' || route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

const navLinks = [
  { name: "Trang Chủ", path: "/home" },
  { name: "Sản Phẩm", path: "/shop" },
  { name: "Giới Thiệu", path: "/about" },
  { name: "Liên Hệ", path: "/contact" },
  { name: "Xem đơn hàng", path: "/order/view_order" },
  { name: "Phòng thử đồ", path: "/fitting-room" },
  { name: "AR Viewer", path: "/AR-room" },
];

const goToCart = () => {
  if (!isAuthenticated.value) {
    navigateTo("/auth/login");
  } else {
    navigateTo("/cart");
  }
};
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div class="container mx-auto px-4 md:px-6">
      <div class="flex items-center justify-between h-20">

        <!-- Logo -->
        <NuxtLink to="/" class="text-2xl font-serif font-bold text-gray-900 tracking-wide">
          GlowUp<span class="text-glow-primary-500">.</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="relative text-sm font-medium transition-all duration-200 uppercase tracking-wider group pb-1"
            :class="isActive(link.path)
              ? 'text-glow-primary-600 font-bold'
              : 'text-gray-600 hover:text-glow-primary-600'"
          >
            {{ link.name }}

            <!-- Underline animation -->
            <span
              class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 bg-glow-primary-500 rounded-full transition-all duration-300"
              :class="isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'"
            />

            <!-- Dot indicator -->
            <span
              v-if="isActive(link.path)"
              class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-glow-primary-500"
            />
          </NuxtLink>
        </nav>

        <!-- Auth Area -->
        <div class="hidden md:flex items-center gap-3">
          <!-- CHƯA LOGIN -->
          <template v-if="!isAuthenticated">
            <NuxtLink
              to="/auth/login"
              class="text-sm font-semibold text-gray-700 px-3 py-2 rounded-full transition-all duration-200 hover:text-blue-600 hover:bg-blue-50"
            >
              Đăng nhập
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-full transition-all duration-200 hover:bg-blue-700 hover:-translate-y-px"
            >
              Đăng ký
            </NuxtLink>
          </template>

          <!-- ĐÃ LOGIN -->
          <template v-else>
            <div class="relative" ref="dropdownRef">
              <button
                @click="toggleUserDropdown"
                class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-glow-primary-600 transition-colors p-2 rounded-lg"
              >
                <div class="w-8 h-8 rounded-full bg-glow-primary-50 flex items-center justify-center text-glow-primary-600">
                  <User class="w-4 h-4" />
                </div>
                <span>{{ displayName }}</span>
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': isUserDropdownOpen }"
                />
              </button>

              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div
                  v-if="isUserDropdownOpen"
                  class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-[60]"
                >
                  <NuxtLink
                    to="/profile"
                    class="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 w-full"
                    @click="closeDropdowns"
                  >
                    <Settings class="w-4 h-4" />
                    Chỉnh sửa thông tin
                  </NuxtLink>
                  <div class="my-1 border-t border-gray-100"></div>
                  <button
                    @click="logout(); closeDropdowns();"
                    class="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                  >
                    <LogOut class="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </transition>
            </div>
          </template>
        </div>

        <!-- Icons -->
        <div class="flex items-center gap-4 text-gray-600">
          <button class="hover:text-glow-primary-600 transition-colors">
            <Search class="w-5 h-5" />
          </button>

          <button
            @click="goToCart"
            class="relative hover:text-glow-primary-600 transition-colors"
          >
            <ShoppingBag class="w-5 h-5" />
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-glow-primary-500 text-[10px] font-bold text-white"
            >
              {{ cartCount }}
            </span>
          </button>

          <!-- Mobile Menu Toggle -->
          <button
            @click="toggleMenu"
            class="md:hidden hover:text-glow-primary-600 transition-colors"
          >
            <Menu v-if="!isMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="isMenuOpen" class="md:hidden border-t border-gray-100 bg-white">
        <nav class="flex flex-col p-4 gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="flex items-center gap-3 py-3 px-3 text-base font-medium border-b border-gray-50 last:border-0 transition-all duration-200 rounded-lg"
            :class="isActive(link.path)
              ? 'text-glow-primary-600 font-bold bg-glow-primary-50 border-l-2 border-l-glow-primary-500'
              : 'text-gray-600 hover:text-glow-primary-600 hover:bg-gray-50'"
            @click="isMenuOpen = false"
          >
            <span
              v-if="isActive(link.path)"
              class="w-1.5 h-1.5 rounded-full bg-glow-primary-500 flex-shrink-0"
            />
            {{ link.name }}
          </NuxtLink>

          <!-- Mobile Auth -->
          <div class="pt-4">
            <template v-if="!isAuthenticated">
              <NuxtLink
                to="/auth/login"
                class="block text-center text-sm font-semibold text-gray-700 px-3 py-2 rounded-full mb-2 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                Đăng nhập
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="block text-center text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-200"
              >
                Đăng ký
              </NuxtLink>
            </template>

            <template v-else>
              <div class="flex flex-col gap-1">
                <p class="text-sm text-gray-500 px-3 py-2">
                  Xin chào, <b>{{ displayName }}</b>
                </p>
                <NuxtLink
                  to="/profile"
                  class="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-600 rounded-lg transition-all duration-200 active:bg-gray-100 hover:bg-gray-50"
                  @click="isMenuOpen = false"
                >
                  <Settings class="w-4 h-4" />
                  Chỉnh sửa thông tin
                </NuxtLink>
                <NuxtLink
                  to="/order/view_order"
                  class="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-600 rounded-lg transition-all duration-200 active:bg-gray-100 hover:bg-gray-50"
                  @click="isMenuOpen = false"
                >
                  <ClipboardList class="w-4 h-4" />
                  Xem đơn hàng
                </NuxtLink>
                <button
                  @click="logout"
                  class="flex items-center gap-3 px-3 py-3 text-base font-medium text-red-600 rounded-lg mt-2 border-t border-gray-100 pt-3 transition-all duration-200 hover:bg-red-50 w-full"
                >
                  <LogOut class="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </template>
          </div>
        </nav>
      </div>
    </transition>
  </header>
</template>