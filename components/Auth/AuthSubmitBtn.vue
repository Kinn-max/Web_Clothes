<template>
  <button
    type="submit"
    :disabled="disabled || loading"
    class="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
  >
    <svg v-if="loading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span>{{ loading ? loadingText : text }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  loadingText?: string;
  loading?: boolean;
  disabled?: boolean;
}>();
</script>