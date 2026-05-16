<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <label for="password" class="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <svg class="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Mật khẩu
      </label>
      <slot name="forgot" />
    </div>

    <div class="relative">
      <input
        id="password"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="show ? 'text' : 'password'"
        autocomplete="current-password"
        placeholder="Nhập mật khẩu"
        :disabled="disabled"
        class="w-full px-4 py-3 pr-12 border-2 rounded-2xl text-sm outline-none transition-all"
        :class="error
          ? 'border-red-400 focus:border-red-400 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
          : 'border-gray-200 hover:border-gray-300 focus:border-purple-400 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]'"
      />
      <button
        type="button"
        @click="show = !show"
        :disabled="disabled"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
      >
        <svg v-if="!show" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 15.12a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>
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
import { ref } from 'vue';
defineProps<{ modelValue: string; error?: string; disabled?: boolean }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
const show = ref(false);
</script>