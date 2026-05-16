<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 -translate-y-2"
    leave-active-class="transition-all duration-200"
    leave-to-class="opacity-0 -translate-y-1"
  >
    <div
      v-if="message"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium mb-5 border"
      :class="type === 'error'
        ? 'bg-red-50 text-red-600 border-red-200'
        : 'bg-green-50 text-green-600 border-green-200'"
    >
      <svg v-if="type === 'error'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <svg v-else class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
  type: 'error' | 'success';
}>();
</script>