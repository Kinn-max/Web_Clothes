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

const { user, isAuthenticated, logout } = useAuth();
const { cartCount } = useCart();

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

// Sử dụng onClickOutside để đóng dropdown khi click ra ngoài
import { onClickOutside } from "@vueuse/core";
onClickOutside(dropdownRef, () => {
  isUserDropdownOpen.value = false;
});

const navLinks = [
  { name: "Trang Chủ", path: "/home" },
  { name: "Sản Phẩm", path: "/shop" },
  { name: "Giới Thiệu", path: "/about" },
  { name: "Liên Hệ", path: "/contact" },
  { name: "Xem đơn hàng", path: "/order/view_order" },
  { name: "Phân tích da mặt", path: "/acne" },
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
  <header
    class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100"
  >
    <div class="container mx-auto px-4 md:px-6">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="text-2xl font-serif font-bold text-gray-900 tracking-wide"
        >
          GlowUp<span class="text-glow-primary-500">.</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="text-sm font-medium text-gray-600 hover:text-glow-primary-600 transition-colors uppercase tracking-wider"
            active-class="text-glow-primary-600"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>

        <!-- Auth Area -->
        <div class="hidden md:flex items-center gap-3">
          <!-- CHƯA LOGIN -->
          <template v-if="!isAuthenticated">
            <NuxtLink to="/auth/login" class="auth-login"> Đăng nhập </NuxtLink>
            <NuxtLink to="/auth/register" class="auth-register">
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
                <div
                  class="w-8 h-8 rounded-full bg-glow-primary-50 flex items-center justify-center text-glow-primary-600"
                >
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
                    class="dropdown-item"
                    @click="closeDropdowns"
                  >
                    <Settings class="w-4 h-4" />
                    Chỉnh sửa thông tin
                  </NuxtLink>
                  <div class="my-1 border-t border-gray-100"></div>
                  <button
                    @click="
                      logout();
                      closeDropdowns();
                    "
                    class="dropdown-item text-red-600 hover:bg-red-50"
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

          <!-- Mobile Menu -->
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
    <div
      v-show="isMenuOpen"
      class="md:hidden border-t border-gray-100 bg-white"
    >
      <nav class="flex flex-col p-4 gap-2">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="py-3 text-base font-medium text-gray-600 hover:text-glow-primary-600 border-b border-gray-50 last:border-0"
          @click="isMenuOpen = false"
        >
          {{ link.name }}
        </NuxtLink>

        <!-- Mobile Auth -->
        <div class="pt-4">
          <template v-if="!isAuthenticated">
            <NuxtLink to="/auth/login" class="block auth-login mb-2">
              Đăng nhập
            </NuxtLink>
            <NuxtLink to="/auth/register" class="block auth-register">
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
                class="mobile-nav-item"
                @click="isMenuOpen = false"
              >
                <Settings class="w-4 h-4" />
                Chỉnh sửa thông tin
              </NuxtLink>
              <NuxtLink
                to="/order/view_order"
                class="mobile-nav-item"
                @click="isMenuOpen = false"
              >
                <ClipboardList class="w-4 h-4" />
                Xem đơn hàng
              </NuxtLink>
              <button
                @click="logout"
                class="mobile-nav-item text-red-600 mt-2 border-t border-gray-100 pt-3"
              >
                <LogOut class="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<style>
.auth-login {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.auth-login:hover {
  color: #0b6fa3;
  background: rgba(11, 111, 163, 0.08);
}

.auth-register {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  background: #0b6fa3;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.auth-register:hover {
  background: #095c88;
  transform: translateY(-1px);
}

.auth-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  transition: all 0.2s ease;
}

.auth-logout:hover {
  background: #fecaca;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
  width: 100%;
}

.dropdown-item:hover {
  background-color: #f9fafb;
  color: #0b6fa3;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #4b5563;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.mobile-nav-item:active {
  background-color: #f3f4f6;
}
</style>
