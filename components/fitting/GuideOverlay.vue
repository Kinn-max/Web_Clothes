<template>
  <Transition
    enter-active-class="transition-opacity duration-[400ms]"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-[400ms]"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
    >
      <div
        class="border-2 border-dashed border-white/30 rounded-3xl w-52 h-96
               flex flex-col items-center justify-center gap-3"
      >
        <svg class="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p class="text-white/40 text-xs text-center px-4">
          Đứng cách camera<br>1–2m, thẳng người
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({ show: { type: Boolean, default: false } })
</script>
