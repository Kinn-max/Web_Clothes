<script setup lang="ts">
import { computed } from "vue";
import { useAuth } from "@/composables/useAuth";

interface Emits {
  (event: "toggle"): void;
}

const emit = defineEmits<Emits>();

const { user, isAuthenticated, logout } = useAuth();

const displayName = computed(() => {
  return user.value?.full_name || user.value?.email || "User";
});

const handleLogout = () => {
  logout();
};
</script>

<template>
  <div
    class="bg-white shadow-sm px-4 py-3 flex items-center justify-between border-b"
  >
    <button
      @click="$emit('toggle')"
      class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <div v-if="isAuthenticated" class="flex items-center gap-3">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span class="text-sm text-gray-700">
          Xin chào,
          <span class="font-semibold text-gray-900">{{ displayName }}</span>
        </span>
      </div>

      <button
        @click="handleLogout"
        class="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-300"
      >
        Đăng xuất
      </button>
    </div>
  </div>
</template>
