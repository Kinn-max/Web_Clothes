<template>
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
    <button
      :disabled="disabled"
      class="w-16 h-16 rounded-full bg-white disabled:opacity-30 flex items-center justify-center
             shadow-xl transition-transform active:scale-90"
      @click="$emit('capture')"
    >
      <div class="w-12 h-12 rounded-full border-2 border-gray-300" />
    </button>
  </div>
</template>

<script setup>
defineProps({ disabled: { type: Boolean, default: false } })
defineEmits(['capture'])
</script>
