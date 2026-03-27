<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <header class="relative pt-24 pb-16 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-glow-primary-50 to-glow-bg opacity-70"></div>
    <div class="container mx-auto px-4 relative z-10 text-center">
      <h1 class="font-serif text-5xl md:text-6xl text-gray-900 mb-4 tracking-tight">
        {{ title || "Bộ Sưu Tập" }}
      </h1>
      <div class="flex items-center justify-center gap-2 text-sm uppercase tracking-widest text-gray-500 font-medium">
        <NuxtLink to="/home" class="hover:text-glow-primary-600 transition-colors">Trang Chủ</NuxtLink>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <span class="text-glow-primary-600">Cửa Hàng</span>
      </div>
    </div>
  </header>
</template>
