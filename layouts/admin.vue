<script setup lang="ts">
import TopBar from "@/components/organisms/admin/TopBar.vue";
import SideMenu from "@/components/organisms/admin/SideMenu.vue";

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <div
      class="flex-shrink-0 transition-all duration-300 ease-in-out bg-[#1E293B] text-white"
      :class="isSidebarOpen ? 'w-64' : 'w-0'"
    >
      <SideMenu v-show="isSidebarOpen" />
    </div>

    <!-- Right content -->
    <div
      class="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
      :class="isSidebarOpen ? 'ml-0' : 'ml-0'"
    >
      <!-- TopBar -->
      <TopBar @toggle="toggleSidebar" />

      <!-- Main content -->
      <main
        class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 bg-gray-100"
      >
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
