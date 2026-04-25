<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ShoppingCart,
  Layers,
  MessageSquare,
  Tag,
  Package,
  Ship,
  Store,
   Shirt
  
} from "lucide-vue-next";
import { icon } from "leaflet";

const router = useRouter();
const route = useRoute();

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Tổng quan hệ thống",
  },
  {
    label: "Sản phẩm",
    path: "/admin/products",
    icon: Package,
    description: "Quản lý sản phẩm",
  },
  {
    label: "Đơn hàng",
    path: "/admin/orders",
    icon: ShoppingCart,
    description: "Danh sách đơn hàng",
  },
  {
    label: "Người dùng",
    path: "/admin/users",
    icon: Users,
    description: "Quản lý người dùng",
  },
  {
    label: "Danh mục",
    path: "/admin/categories",
    icon: Layers,
    description: "Quản lý danh mục",
  },
  {
    label: "Đánh giá",
    path: "/admin/reviews",
    icon: MessageSquare,
    description: "Bình luận & xếp hạng",
  },
  {
    label: "Vận chuyển",
    path:"/admin/shipping",
    icon: Ship,
    description:"Quản lý vận chuyển"
  },
  {
    label: "Khuyến mãi",
    path: "/admin/vouchers",
    icon: Tag,
    description: "Mã giảm giá & ưu đãi",
  },
  {
    label: "Cửa hàng",
    path: "/admin/stores",
    icon: Store,
    description: "Quản lý cửa hàng",
  },
  {
    label: "Thời trang AR",
    path:"/admin/garments",
    icon: Shirt,
    description:"Quản lý trang phục AR"
  }
];

const isActive = (path: string) => route.path.startsWith(path);

const goTo = (path: string) => {
  if (route.path !== path) {
    router.push(path);
  }
};

// Get user info
</script>

<template>
  <aside
    class="h-full flex flex-col bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white shadow-2xl"
  >
    <!-- Logo & Brand -->
    <div
      class="h-20 flex flex-col items-center justify-center border-b border-blue-800/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
        >
          <Shirt class="w-6 h-6 text-white" />
        </div>
        <div>
          <span
            class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            GlowUp
          </span>
          <div class="text-[10px] text-gray-400 -mt-1">Admin Portal</div>
        </div>
      </div>
    </div>

    <!-- Menu -->
    <nav
      class="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent"
    >
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <button
            @click="goTo(item.path)"
            class="w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden"
            :class="
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                : 'text-gray-300 hover:bg-blue-800/30 hover:text-white hover:translate-x-1'
            "
          >
            <!-- Active indicator -->
            <div
              v-if="isActive(item.path)"
              class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
            ></div>

            <!-- Icon with animation -->
            <div class="relative">
              <component
                :is="item.icon"
                class="w-5 h-5 transition-transform duration-300"
                :class="
                  isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'
                "
              />
              <!-- Pulse effect for active item -->
              <div
                v-if="isActive(item.path)"
                class="absolute inset-0 bg-white/20 rounded-full animate-ping"
              ></div>
            </div>

            <div class="flex-1 text-left">
              <div class="text-sm leading-none">{{ item.label }}</div>
              <div
                class="text-[10px] text-gray-400 transition-all duration-200 overflow-hidden"
                :class="isActive(item.path) ? 'max-h-0 opacity-0 mt-0' : 'max-h-0 opacity-0 mt-0 group-hover:max-h-4 group-hover:opacity-100 group-hover:mt-0.5'"
              >
                {{ item.description }}
              </div>
            </div>

            <!-- Arrow indicator -->
            <svg
              v-if="isActive(item.path)"
              class="w-4 h-4 ml-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-blue-800/30 bg-blue-900/10">
      <div class="text-center">
        <div class="text-xs text-gray-400">© 2026 GlowUp</div>
        <div class="text-[10px] text-gray-500 mt-1">
          Medical Appointment System
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #1e40af;
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

/* Smooth animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

nav ul li {
  animation: slideIn 0.3s ease-out forwards;
}

nav ul li:nth-child(1) {
  animation-delay: 0.05s;
}
nav ul li:nth-child(2) {
  animation-delay: 0.1s;
}
nav ul li:nth-child(3) {
  animation-delay: 0.15s;
}
nav ul li:nth-child(4) {
  animation-delay: 0.2s;
}
nav ul li:nth-child(5) {
  animation-delay: 0.25s;
}
nav ul li:nth-child(6) {
  animation-delay: 0.3s;
}
</style>
