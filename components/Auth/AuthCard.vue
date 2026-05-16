<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute w-72 h-72 -top-24 -right-24 rounded-full bg-purple-100/50 animate-float" />
      <div class="absolute w-48 h-48 -bottom-12 -left-12 rounded-full bg-pink-100/50 animate-float [animation-delay:-7s]" />
      <div class="absolute w-36 h-36 top-1/2 left-[10%] rounded-full bg-purple-100/50 animate-float [animation-delay:-14s]" />
    </div>

    <div class="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-9 shadow-xl relative z-10">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-7">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-200 mb-4 animate-pulse">
          <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          {{ title }}
        </h1>
        <p class="text-sm text-gray-400 mt-1">{{ subtitle }}</p>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-float { animation: float 20s infinite ease-in-out; }
</style>