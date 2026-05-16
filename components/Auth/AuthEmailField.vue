<template>
  <div class="flex flex-col gap-2">
    <label for="email" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <svg class="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 6l9 6 9-6" />
      </svg>
      Email
    </label>
    <div class="relative">
      <input
        id="email"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value.trim())"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        :disabled="disabled"
        class="w-full px-4 py-3 pr-10 border-2 rounded-2xl text-sm outline-none transition-all"
        :class="error
          ? 'border-red-400 focus:border-red-400 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
          : 'border-gray-200 hover:border-gray-300 focus:border-purple-400 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]'"
      />
      <svg
        v-if="modelValue && !error"
        class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0"
    >
      <p v-if="error" class="text-xs text-red-500 font-medium flex items-center gap-1">
        <span>⚠</span> {{ error }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; error?: string; disabled?: boolean }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>